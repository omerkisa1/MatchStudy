from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.user_interests import add_interest, delete_interest, get_interests_by_user

router = APIRouter()

class InterestRequest(BaseModel):
    user_id: int
    interest: str

@router.post("/add")
async def add_user_interest(request: InterestRequest):
    try:
        add_interest(request.user_id, request.interest)
        return {"success": True, "message": "Interest added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete")
async def delete_user_interest(request: InterestRequest):
    try:
        delete_interest(request.user_id, request.interest)
        return {"success": True, "message": "Interest deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def get_user_interests(user_id: int):
    try:
        interests = get_interests_by_user(user_id)
        return {"success": True, "interests": interests}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
