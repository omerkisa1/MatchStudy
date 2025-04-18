import sys
from fastapi import APIRouter, HTTPException

from database.profiles import (
    add_profile, get_profile_by_user_id, update_profile, delete_profile_by_user_id, list_profiles
)

router = APIRouter()

@router.post("/create")
async def add_profile_endpoint(user_id: int, name: str, university: str, department: str, interests: list[str]):
    try:
        add_profile(user_id, name, university, department, interests)
        return {"message": "Profile created successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Profil oluşturulamadı.")

@router.get("/{profile_id}")
async def get_profile_endpoint(profile_id: int):
    try:
        profile = get_profile_by_user_id(profile_id)
        if profile:
            return {"message": "Profile found", "profile": profile}
        raise HTTPException(status_code=404, detail="Profil bulunamadı.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Profil getirilemedi.")

@router.put("/update/{profile_id}")
async def update_profile_endpoint(profile_id: int, name: str = None, university: str = None, 
                                department: str = None, interests: list[str] = None):
    try:
        update_profile(profile_id, name, university, department, interests)
        return {"message": "Profile updated successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Profil güncellenemedi.")

@router.delete("/delete/{profile_id}")
async def delete_profile_endpoint(profile_id: int):
    try:
        delete_profile_by_user_id(profile_id)
        return {"message": "Profile deleted successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Profil silinemedi.")

@router.get("/list")
async def list_profiles_endpoint():
    try:
        profiles = list_profiles()
        return {"message": "Profiles found", "profiles": profiles}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Profiller getirilemedi.")
