from fastapi import APIRouter
from database.users import add_user, get_user_by_id, list_users,delete_user_by_id

router = APIRouter()

@router.post("/users")
async def add_user_endpoint(email: str, password: str):
    return add_user(email, password)

@router.get("/users/{user_id}")
async def get_user_by_id_endpoint(user_id: int):
    return get_user_by_id(user_id)

@router.get("/users")
async def list_users_endpoint():
    return list_users()

@router.delete("/users/{user_id}")
async def delete_user_by_id_enpoint(user_id: int):
    return delete_user_by_id(user_id)