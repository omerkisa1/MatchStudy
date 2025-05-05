from fastapi import APIRouter, HTTPException, Body
from database.chat import create_chat, get_chat_id
from database.message import save_message, get_messages_by_chat, mark_message_read
from database.message_status import update_delivery_status

router = APIRouter()


@router.post("/chat/create")
async def create_chat_endpoint(user_1_id: int = Body(...), user_2_id: int = Body(...), chat_id: str = Body(...)):
    try:
        create_chat(user_1_id, user_2_id, chat_id)
        return {"success": True, "chat_id": chat_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/{user_1_id}/{user_2_id}")
async def get_or_create_chat(user_1_id: int, user_2_id: int):
    chat_id = get_chat_id(user_1_id, user_2_id)
    if chat_id:
        return {"success": True, "chat_id": chat_id}
    return {"success": False, "message": "Chat not found"}


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