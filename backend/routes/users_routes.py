from fastapi import APIRouter
import sys
from .filePaths import myPath

sys.path.append(myPath)

from users import add_user, get_user_by_id

router = APIRouter()

@router.post("/add")
def create_user(email: str, password: str):
    return add_user(email, password)

@router.get("/user/{user_id}")
def read_user(user_id: int):
    return get_user_by_id(user_id)
