import pytest
from fastapi.testclient import TestClient
import json

from backend.models.profile import ProfileCreate, ProfileUpdate

def test_create_profile(client, mock_profile_db):
    """Test creating a new profile"""
    # Prepare test data
    profile_data = {
        "user_id": 42,
        "name": "Jane",
        "surname": "Doe",
        "age": 25,
        "education_level": "Bachelor",
        "institution": "Example University"
    }
    
    # Make the request
    response = client.post("/profiles/create", json=profile_data)
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Profile created successfully"
    
    # Verify mock was called with correct arguments
    mock_profile_db["add"].assert_called_once_with(
        profile_data["user_id"],
        profile_data["name"],
        profile_data["surname"],
        profile_data["age"],
        profile_data["education_level"],
        profile_data["institution"]
    )

def test_get_profile(client, mock_profile_db):
    """Test retrieving a profile by user_id"""
    # Make the request
    user_id = 42
    response = client.get(f"/profiles/{user_id}")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Profile found"
    assert data["data"] == mock_profile_db["sample_profile"]
    
    # Verify mock was called with correct arguments
    mock_profile_db["get"].assert_called_once_with(user_id)

def test_update_profile(client, mock_profile_db):
    """Test updating a profile"""
    # Prepare test data
    user_id = 42
    update_data = {
        "name": "Janet",
        "surname": "Smith",
        "education_level": "Master"
    }
    
    # Make the request
    response = client.put(f"/profiles/update/{user_id}", json=update_data)
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Profile updated successfully"
    
    # Verify mock was called with correct arguments
    mock_profile_db["update"].assert_called_once_with(
        user_id,
        update_data["name"],
        update_data["surname"],
        None,  # Age not provided in update
        update_data["education_level"],
        None   # Institution not provided in update
    )

def test_delete_profile(client, mock_profile_db):
    """Test deleting a profile"""
    # Make the request
    user_id = 42
    response = client.delete(f"/profiles/delete/{user_id}")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Profile deleted successfully"
    
    # Verify mock was called with correct arguments
    mock_profile_db["delete"].assert_called_once_with(user_id)

def test_list_profiles(client, mock_profile_db):
    """Test listing all profiles"""
    # Make the request
    response = client.get("/profiles/list")
    
    # Check the response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Profiles retrieved successfully"
    assert data["data"] == [mock_profile_db["sample_profile"]]
    
    # Verify mock was called
    mock_profile_db["list"].assert_called_once() 