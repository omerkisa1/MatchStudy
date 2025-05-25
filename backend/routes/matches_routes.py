import sys
from fastapi import APIRouter, HTTPException, Body

from database.matches import (
    add_match,
    get_match_by_id,
    get_matches_by_requester_id,
    get_matches_by_responder_id,
    update_match_status,
    delete_match,
    list_macthes,
    get_matches_for_responder,
    get_old_matches_for_responder
)

router = APIRouter()

@router.post("/create")
async def create_match_endpoint(user1_id: int, user2_id: int, request_id: int):
    try:
        add_match(user1_id, user2_id, request_id)
        return {"message": "Match created successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Eşleşme oluşturulamadı.")

@router.get("/{match_id}")
async def get_match_endpoint(match_id: int):
    try:
        match = get_match_by_id(match_id)
        if match:
            return {"message": "Match found", "match": match}
        raise HTTPException(status_code=404, detail="Eşleşme bulunamadı.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Eşleşme getirilemedi.")

@router.put("/update/{match_id}")
async def update_match_status_endpoint(match_id: int, status: str):
    try:
        update_match_status(match_id, status)
        return {"message": "Match status updated successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Eşleşme durumu güncellenemedi.")

@router.delete("/delete/{match_id}")
async def delete_match_endpoint(match_id: int):
    try:
        delete_match(match_id)
        return {"message": "Match deleted successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Eşleşme silinemedi.")

@router.get("/list")
async def list_matches_endpoint():
    try:
        matches = list_macthes()
        return {"message": "Matches found", "matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Eşleşmeler getirilemedi.")

@router.get("/user/{user_id}")
async def list_user_matches_endpoint(user_id: int):
    try:
        # Get matches where user is either requester or responder
        as_requester = get_matches_by_requester_id(user_id)
        as_responder = get_matches_by_responder_id(user_id)
        
        # Debug log
        print(f"Requester eşleşmeleri: {as_requester}")
        print(f"Responder eşleşmeleri: {as_responder}")
        
        # Combine both match lists
        all_matches = []
        if as_requester:
            all_matches.extend(as_requester)
        if as_responder:
            all_matches.extend(as_responder)
            
        # Veri tutarlılığını kontrol et
        print(f"Tüm eşleşmeler: {all_matches}")
        
        return {"matches": all_matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kullanıcı eşleşmeleri getirilemedi: {str(e)}")

@router.get("/notifications/{user_id}")
async def get_match_notifications(user_id: int):
    try:
        matches = get_matches_for_responder(user_id)
        return {"notifications": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Bildirimler getirilemedi.")

@router.get("/history/{user_id}")
async def get_old_match_notifications(user_id: int):
    try:
        matches = get_old_matches_for_responder(user_id)
        return {"history": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Geçmiş eşleşmeler getirilemedi.")

@router.put("/{match_id}/respond")
async def respond_to_match(match_id: int, status: str = Body(..., embed=True)):
    try:
        # Validate status
        if status not in ["accepted", "rejected"]:
            raise ValueError("Status must be 'accepted' or 'rejected'")
            
        # Update match status
        update_match_status(match_id, status)
        return {"success": True, "message": f"Match status updated to {status}"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update match: {str(e)}")
