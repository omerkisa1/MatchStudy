from fastapi import APIRouter, HTTPException
from database.friend_requests import (send_friend_request, manage_friend_request_status)

router = APIRouter()

@router.post("/send")
async def send_request(sender_id: int, receiver_id: int):
    try:
        send_friend_request(sender_id, receiver_id)
        return {"message": "Arkadaşlık isteği başarıyla gönderildi"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Arkadaşlık isteği gönderilemedi")

@router.post("/manage")
async def manage_request(request_id: int, receiver_id: int, status: str):
    try:
        manage_friend_request_status(request_id, receiver_id, status)
        return {"message": f"Arkadaşlık isteği '{status}' olarak güncellendi"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="İstek durumu güncellenemedi")
