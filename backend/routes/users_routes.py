import sys
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.users import (
    add_user, get_user_by_id, list_users, delete_user_by_id, login_user, get_user_id
)
router = APIRouter()

class LoginCredentials(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login_user_endpoint(credentials: LoginCredentials):
    try:
        if login_user(credentials.email, credentials.password):
            return {"message": "User logged in"}
        raise HTTPException(status_code=401, detail="Kullanıcı giriş yapamadı.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı giriş yapamadı.")

@router.post("/add")
async def add_user_endpoint(email: str, password: str,name:str,surname:str,age:int,education_level:str):
    try:
        add_user(email, password,name,surname,age,education_level)
        return {"message": True
                }
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


@router.get("/get_id")
async def get_user_id_endpoint(email: str, password: str):
    try:
        user_id = get_user_id(email, password)
        if user_id is None:
            return {"message": "User not found", "status": 404}
        return {"message": "User found", "user_id": user_id, "status": 200}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
