from typing import Optional
from pydantic import BaseModel, Field

class ProfileBase(BaseModel):
    """Base model for profile data"""
    name: str = Field(description="User's first name")
    surname: str = Field(description="User's last name")
    age: Optional[int] = Field(default=None, description="User's age")
    education_level: Optional[str] = Field(default=None, description="User's education level")
    institution: Optional[str] = Field(default=None, description="User's educational institution")

class ProfileCreate(ProfileBase):
    """Model for creating a new profile"""
    user_id: int = Field(description="ID of the user this profile belongs to")

class ProfileUpdate(BaseModel):
    """Model for updating an existing profile"""
    name: Optional[str] = Field(default=None, description="User's first name")
    surname: Optional[str] = Field(default=None, description="User's last name")
    age: Optional[int] = Field(default=None, description="User's age")
    education_level: Optional[str] = Field(default=None, description="User's education level")
    institution: Optional[str] = Field(default=None, description="User's educational institution")

class ProfileResponse(ProfileBase):
    """Model for profile response"""
    profile_id: int = Field(description="Profile ID")
    user_id: int = Field(description="User ID")
    created_at: str = Field(description="When the profile was created")
    updated_at: Optional[str] = Field(default=None, description="When the profile was last updated")
    
    class Config:
        from_attributes = True 