import sys
from fastapi import APIRouter, HTTPException

from .filePaths import myPath

sys.path.append(myPath)

from users import (
    add_user, get_user_by_id, list_users, delete_user_by_id
)
router = APIRouter()

@router.post("/add")
async def add_user_endpoint(email: str, password: str):
    try:
        add_user(email, password)
        return {"message": "User added"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı eklenemedi.")

@router.get("/user/{user_id}")
async def get_user_by_id_endpoint(user_id: int):
    try:
        user = get_user_by_id(user_id)
        if user:
            return {"message": "User found", "user": user, "status": 200}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı getirilemedi.")

@router.get("/list")
async def list_users_endpoint():
    try:
        users = list_users()
        return {"message": "Users found", "users": users, "status": 200}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcılar getirilemedi.")

@router.delete("/delete/{user_id}")
async def delete_user_by_id_enpoint(user_id: int):
    try:
        delete_user_by_id(user_id)
        return {"message": "User deleted"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı silinemedi.")

