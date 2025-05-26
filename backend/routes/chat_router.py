from fastapi import APIRouter, HTTPException, Body
from database.chat import create_chat, get_chat_id
from database.message import save_message, get_messages_by_chat, mark_message_read, get_last_message_by_chat
from database.message_status import update_delivery_status, mark_messages_read_by_chat, get_unread_counts_by_user
from database.friend_requests import get_friend_requests_by_id
import time
import json
import mysql.connector
from database.config import DB_CONFIG
from datetime import datetime

router = APIRouter()

def is_user_blocked(user_id: int, blocked_user_id: int) -> bool:
    """Check if a user is blocked by another user using friend requests"""
    try:
        requests = get_friend_requests_by_id(user_id)
        for request in requests:
            if request['sender_id'] == blocked_user_id and request['status'] == 'blocked':
                return True
        return False
    except Exception:
        return False

@router.post("/chat/create")
async def create_chat_endpoint(
    request_data: dict = Body(...)
):
    try:
        user_1_id = request_data.get("user_1_id")
        user_2_id = request_data.get("user_2_id")
        
        if not all([user_1_id, user_2_id]):
            return {"success": False, "message": "Missing required parameters"}
        
        # Kullanıcı ID'lerini küçükten büyüğe sıralayarak sabit bir chat_id oluştur
        smaller_id = min(user_1_id, user_2_id)
        larger_id = max(user_1_id, user_2_id)
        chat_id = f"{smaller_id}_{larger_id}"
            
        # Check if either user has blocked the other
        if is_user_blocked(user_1_id, user_2_id) or is_user_blocked(user_2_id, user_1_id):
            raise HTTPException(status_code=403, detail="Sohbet oluşturulamıyor: Kullanıcı engellenmiş")
            
        create_chat(user_1_id, user_2_id, chat_id)
        return {"success": True, "chat_id": chat_id}
    except Exception as e:
        return {"success": False, "message": str(e)}


@router.get("/chat/{user_1_id}/{user_2_id}")
async def get_or_create_chat(user_1_id: int, user_2_id: int):
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Kullanıcı ID'lerini küçükten büyüğe sıralayarak sabit bir chat_id oluştur
        smaller_id = min(user_1_id, user_2_id)
        larger_id = max(user_1_id, user_2_id)
        chat_id = f"{smaller_id}_{larger_id}"
        
        # Önce sohbetin var olup olmadığını kontrol et
        query = """
            SELECT chat_id FROM chats 
            WHERE 
                chat_id = %s AND
                ((user_1_id = %s AND user_2_id = %s)
                OR 
                (user_1_id = %s AND user_2_id = %s))
        """
        cursor.execute(query, (chat_id, user_1_id, user_2_id, user_2_id, user_1_id))
        result = cursor.fetchone()
        
        # Make sure we consume all results
        if cursor.with_rows:
            cursor.fetchall()
        
        if result:
            # Sohbet varsa, ID'yi döndür
            return {"success": True, "chat_id": chat_id}
        else:
            # Sohbet yoksa veya gizlenmişse, yeni bir sohbet oluştur
            
            # Öncelikle kullanıcıların birbirini engelleyip engellemediğini kontrol et
            if is_user_blocked(user_1_id, user_2_id) or is_user_blocked(user_2_id, user_1_id):
                return {"success": False, "message": "Kullanıcı engellendi"}
                
            insert_query = """
                INSERT INTO chats (chat_id, user_1_id, user_2_id, created_at)
                VALUES (%s, %s, %s, NOW())
            """
            cursor.execute(insert_query, (chat_id, user_1_id, user_2_id))
            connection.commit()
            
            return {"success": True, "chat_id": chat_id, "newly_created": True}
    except Exception as e:
        if connection and connection.is_connected():
            connection.rollback()
        return {"success": False, "message": str(e)}
    finally:
        if cursor and cursor.with_rows:
            # Consume any remaining results to avoid "unread result" errors
            cursor.fetchall()
            
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@router.post("/messages/send")
async def send_message_endpoint(chat_id: str = Body(...), sender_id: int = Body(...), content: str = Body(...)):
    try:
        # Chat ID'den alıcı ID'sini bul (format: smaller_id_larger_id)
        user_ids = list(map(int, chat_id.split('_')))
        receiver_id = user_ids[0] if sender_id == user_ids[1] else user_ids[1]
        
        # Check if either user has blocked the other
        if is_user_blocked(sender_id, receiver_id) or is_user_blocked(receiver_id, sender_id):
            raise HTTPException(status_code=403, detail="Mesaj gönderilemiyor: Kullanıcı engellenmiş")
            
        message_id = save_message(chat_id, sender_id, content)
        update_delivery_status(message_id, delivered=True)
        return {"success": True, "message_id": message_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/{chat_id}")
async def get_messages(chat_id: str):
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Mesajları getir
        messages_query = "SELECT * FROM messages WHERE chat_id = %s ORDER BY sent_at ASC"
        cursor.execute(messages_query, (chat_id,))
        messages = cursor.fetchall()  # Fetch all results to avoid unread result errors
        
        # Python DateTime objelerini ISO string formatına dönüştür
        for msg in messages:
            if 'sent_at' in msg and msg['sent_at']:
                if isinstance(msg['sent_at'], datetime):
                    msg['sent_at'] = msg['sent_at'].isoformat()
                
        return {"success": True, "messages": messages}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        if cursor and cursor.with_rows:
            # Consume any remaining results
            cursor.fetchall()
            
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@router.post("/messages/mark_read")
async def mark_message_as_read(message_id: int = Body(...)):
    try:
        mark_message_read(message_id)
        update_delivery_status(message_id, read=True)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/messages/mark_read_by_chat")
async def mark_chat_messages_read(chat_id: str = Body(...), user_id: int = Body(...)):
    try:
        count = mark_messages_read_by_chat(chat_id, user_id)
        return {"success": True, "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/unread/{user_id}")
async def get_unread_message_counts(user_id: int):
    try:
        unread_counts = get_unread_counts_by_user(user_id)
        return {"success": True, "unread_counts": unread_counts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/hide/{chat_id}")
async def hide_chat_for_user(chat_id: str, user_id: int = Body(...)):
    # Dummy function that just returns success
    return {"success": True, "message": "Chat hide feature is temporarily disabled"}

@router.get("/messages/last/{chat_id}")
async def get_last_message(chat_id: str):
    try:
        last_message = get_last_message_by_chat(chat_id)
        if last_message:
            if 'sent_at' in last_message and isinstance(last_message['sent_at'], datetime):
                last_message['sent_at'] = last_message['sent_at'].isoformat()
            return {"success": True, "message": last_message}
        else:
            return {"success": True, "message": None}
    except Exception as e:
        return {"success": False, "detail": str(e)}
