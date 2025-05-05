import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from backend.main import app
from backend.models.profile import ProfileCreate, ProfileUpdate, ProfileResponse

@pytest.fixture
def client():
    """Create a test client for the FastAPI application"""
    return TestClient(app)

@pytest.fixture
def mock_profile_db():
    """Mock the database functions for profiles module"""
    with patch("backend.database.profiles.add_profile") as mock_add, \
         patch("backend.database.profiles.get_profile_by_user_id") as mock_get, \
         patch("backend.database.profiles.update_profile") as mock_update, \
         patch("backend.database.profiles.delete_profile_by_user_id") as mock_delete, \
         patch("backend.database.profiles.list_profiles") as mock_list:
        
        # Create sample profile data
        sample_profile = {
            "profile_id": 1,
            "user_id": 42,
            "name": "Jane",
            "surname": "Doe",
            "age": 25,
            "education_level": "Bachelor",
            "institution": "Example University",
            "created_at": "2023-01-01T12:00:00",
            "updated_at": "2023-01-02T12:00:00"
        }
        
        # Set up mock return values
        mock_get.return_value = sample_profile
        mock_list.return_value = [sample_profile]
        
        yield {
            "add": mock_add,
            "get": mock_get,
            "update": mock_update,
            "delete": mock_delete,
            "list": mock_list,
            "sample_profile": sample_profile
        } 