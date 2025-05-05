from fastapi import APIRouter, HTTPException
from database.user_interests import add_interest, delete_interest, get_interests_by_user

router = APIRouter()

@router.post("/interests/add")
async def add_interest_endpoint(user_id: int, interest: str):
    try:
        add_interest(user_id, interest)
        return {"message": "Interest added successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.delete("/interests/delete")
async def delete_interest_endpoint(user_id: int, interest: str):
    try:
        delete_interest(user_id, interest)
        return {"message": "Interest deleted successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/interests/list/{user_id}")
async def list_interests_endpoint(user_id: int):
    try:
        interests = get_interests_by_user(user_id)
        return {"user_id": user_id, "interests": interests}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch interests")