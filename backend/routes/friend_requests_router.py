from fastapi import APIRouter, HTTPException, Body
from database.friend_requests import (send_friend_request, manage_friend_request_status, get_friend_requests_by_id,get_friend_list_by_id)
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

class FriendRequestBody(BaseModel):
    sender_id: int
    receiver_id: int

class ManageRequestBody(BaseModel):
    sender_id: int
    receiver_id: int
    status: str

class BlockUserBody(BaseModel):
    user_id: int
    blocked_user_id: int

class UnfriendBody(BaseModel):
    user_id: int
    friend_id: int

@router.post("/send")
async def send_request(
    sender_id: Optional[int] = None, 
    receiver_id: Optional[int] = None,
    request_data: Optional[FriendRequestBody] = Body(None)
):
    try:
        # Request body'den parametreleri al veya query string'den gelen parametreleri kullan
        final_sender_id = request_data.sender_id if request_data else sender_id
        final_receiver_id = request_data.receiver_id if request_data else receiver_id
        
        if not final_sender_id or not final_receiver_id:
            raise ValueError("Eksik parametreler: sender_id ve receiver_id gerekli")
            
        send_friend_request(final_sender_id, final_receiver_id)
        return {"success": True, "message": "Arkadaşlık isteği başarıyla gönderildi"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Arkadaşlık isteği gönderilemedi")

@router.post("/manage")
async def manage_request(
    request_data: ManageRequestBody
):
    try:
        # Request body'den parametreleri al veya query string'den gelen parametreleri kullan
        final_sender_id = request_data.sender_id if request_data else sender_id
        final_receiver_id = request_data.receiver_id if request_data else receiver_id
        final_status = request_data.status if request_data else status
        
        if not final_sender_id or not final_receiver_id or not final_status:
            raise ValueError("Eksik parametreler: sender_id, receiver_id ve status gerekli")
            
        manage_friend_request_status(final_sender_id, final_receiver_id, final_status)
        return {"success": True, "message": f"Arkadaşlık isteği '{final_status}' olarak güncellendi"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
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
async def block_user_endpoint(
    user_id: Optional[int] = None, 
    blocked_user_id: Optional[int] = None,
    request_data: Optional[BlockUserBody] = Body(None)
):
    try:
        # Request body'den parametreleri al veya query string'den gelen parametreleri kullan
        final_user_id = request_data.user_id if request_data else user_id
        final_blocked_user_id = request_data.blocked_user_id if request_data else blocked_user_id
        
        if not final_user_id or not final_blocked_user_id:
            raise ValueError("Eksik parametreler: user_id ve blocked_user_id gerekli")
            
        manage_friend_request_status(final_blocked_user_id, final_user_id, 'blocked')
        return {"success": True, "message": "Kullanıcı başarıyla engellendi"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı engellenemedi")

@router.post("/unfriend")
async def unfriend_user_endpoint(
    user_id: Optional[int] = None, 
    friend_id: Optional[int] = None,
    request_data: Optional[UnfriendBody] = Body(None)
):
    try:
        # Request body'den parametreleri al veya query string'den gelen parametreleri kullan
        final_user_id = request_data.user_id if request_data else user_id
        final_friend_id = request_data.friend_id if request_data else friend_id
        
        if not final_user_id or not final_friend_id:
            raise ValueError("Eksik parametreler: user_id ve friend_id gerekli")
            
        manage_friend_request_status(final_friend_id, final_user_id, 'rejected')
        return {"success": True, "message": "Arkadaşlıktan başarıyla çıkarıldı"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Arkadaşlıktan çıkarılamadı")