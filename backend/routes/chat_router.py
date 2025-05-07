from fastapi import APIRouter, HTTPException, Body
from database.chat import create_chat, get_chat_id
from database.message import save_message, get_messages_by_chat, mark_message_read
from database.message_status import update_delivery_status, mark_messages_read_by_chat, get_unread_counts_by_user
import time

router = APIRouter()


@router.post("/chat/create")
async def create_chat_endpoint(
    request_data: dict = Body(...)
):
    try:
        user_1_id = request_data.get("user_1_id")
        user_2_id = request_data.get("user_2_id")
        chat_id = request_data.get("chat_id")
        
        if not all([user_1_id, user_2_id, chat_id]):
            return {"success": False, "message": "Missing required parameters"}
            
        create_chat(user_1_id, user_2_id, chat_id)
        return {"success": True, "chat_id": chat_id}
    except Exception as e:
        return {"success": False, "message": str(e)}


@router.get("/chat/{user_1_id}/{user_2_id}")
async def get_or_create_chat(user_1_id: int, user_2_id: int):
    try:
        # Try to get existing chat ID
        chat_id = get_chat_id(user_1_id, user_2_id)
        
        if chat_id:
            # If chat exists, return it
            return {"success": True, "chat_id": chat_id}
        else:
            # If chat doesn't exist, create one with an auto-generated ID
            new_chat_id = f"chat_{user_1_id}_{user_2_id}_{int(time.time())}"
            create_chat(user_1_id, user_2_id, new_chat_id)
            return {"success": True, "chat_id": new_chat_id, "newly_created": True}
    except Exception as e:
        return {"success": False, "message": str(e)}


@router.post("/messages/send")
async def send_message_endpoint(chat_id: str = Body(...), sender_id: int = Body(...), content: str = Body(...)):
    try:
        message_id = save_message(chat_id, sender_id, content)
        update_delivery_status(message_id, delivered=True)
        return {"success": True, "message_id": message_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/{chat_id}")
async def get_messages(chat_id: str):
    try:
        messages = get_messages_by_chat(chat_id)
        return {"success": True, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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