from fastapi import APIRouter, HTTPException
from database.friend_requests import (send_friend_request, manage_friend_request_status, get_friend_requests_by_id,get_friend_list_by_id)

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
async def manage_request(sender_id: int, receiver_id: int, status: str):
    try:
        manage_friend_request_status(sender_id, receiver_id, status)
        return {"message": f"Arkadaşlık isteği '{status}' olarak güncellendi"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="İstek durumu güncellenemedi")
@router.get("/get_friend_requests")
async def get_requests(user_id: int):
    try:
        requests = get_friend_requests_by_id(user_id)
        return {"message": "Arkadaşlık isteği başarıyla listelendi",
                "requests": requests}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Arkadaşlık isteği listelenemedi")

@router.get("/list_friends/{user_id}")
async def list_friends(user_id: int):
    try:
        
        friends = get_friend_list_by_id(user_id)

        if not friends:
            return {"message": "No friends found", "data": []}

        return {"message": "Friends retrieved successfully", "data": friends}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/block")
async def block_user_endpoint(user_id: int, blocked_user_id: int):
    try:
        manage_friend_request_status(blocked_user_id, user_id, 'blocked')
        return {"message": "Kullanıcı başarıyla engellendi"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı engellenemedi")

@router.post("/unfriend")
async def unfriend_user_endpoint(user_id: int, friend_id: int):
    try:
        manage_friend_request_status(friend_id, user_id, 'rejected')
        return {"message": "Arkadaşlıktan başarıyla çıkarıldı"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Arkadaşlıktan çıkarılamadı")