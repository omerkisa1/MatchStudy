import sys
from fastapi import APIRouter, HTTPException

from database.matches import (
    add_match,
    get_match_by_id,
    get_matches_by_requester_id,
    get_matches_by_responder_id,
    update_match_status,
    delete_match,
    list_macthes
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
        print(f"Match oluşturulamadı: {e}", file=sys.stderr)
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
        matches = get_match_by_id(user_id)
        return {"message": "User matches found", "matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı eşleşmeleri getirilemedi.") 