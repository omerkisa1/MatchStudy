import sys
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List

from database.profiles import (
    add_profile, get_bio_by_user_id, get_profile_by_user_id, update_profile, delete_profile_by_user_id, list_profiles
)
from models.base import StandardResponse
from models.profile import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter()

@router.post("/create", response_model=StandardResponse)
async def add_profile_endpoint(profile: ProfileCreate):
    try:
        add_profile(
            profile.user_id, 
            profile.name, 
            profile.surname, 
            profile.age, 
            profile.education_level, 
            profile.institution
        )
        return StandardResponse.success_response("Profile created successfully")
    except ValueError as ve:
        return StandardResponse.error_response("Validation error", [str(ve)])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create profile")

@router.get("/{user_id}", response_model=StandardResponse)
async def get_profile_endpoint(user_id: int):
    try:
        profile = get_profile_by_user_id(user_id)
        if profile:
            return StandardResponse.success_response("Profile found", profile)
        return StandardResponse.error_response("Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")

@router.put("/get/{user_id}", response_model=StandardResponse)
async def get_bio_by_user_id_endpoint(user_id):
    try:
        bio=get_bio_by_user_id(user_id)
        if bio:
            return StandardResponse.success_response("Biography found", bio)
        return StandardResponse.error_response("Biography not found") 
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")



@router.put("/update/{user_id}", response_model=StandardResponse)
async def update_profile_endpoint(user_id: int, profile_update: ProfileUpdate):
    try:
        update_profile(
            user_id,
            profile_update.name,
            profile_update.surname,
            profile_update.age,
            profile_update.education_level,
            profile_update.institution
        )
        return StandardResponse.success_response("Profile updated successfully")
    except ValueError as ve:
        return StandardResponse.error_response("Validation error", [str(ve)])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.delete("/delete/{user_id}", response_model=StandardResponse)
async def delete_profile_endpoint(user_id: int):
    try:
        delete_profile_by_user_id(user_id)
        return StandardResponse.success_response("Profile deleted successfully")
    except ValueError as ve:
        return StandardResponse.error_response("Validation error", [str(ve)])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete profile")

@router.get("/list", response_model=StandardResponse)
async def list_profiles_endpoint():
    try:
        profiles = list_profiles()
        return StandardResponse.success_response("Profiles retrieved successfully", profiles)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve profiles")
