from fastapi import APIRouter
from database.users import add_user, get_user_by_id

router = APIRouter()

@router.post("/users")
def create_user(email: str, password: str):
    return add_user(email, password)

@router.get("/users/{user_id}")
def read_user(user_id: int):
    return get_user_by_id(user_id)
