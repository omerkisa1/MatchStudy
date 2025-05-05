# MatchStudy Backend

This is the FastAPI backend for the MatchStudy application, following best practices for API design.

## Architecture

The backend follows a layered architecture:

- **Routes**: API endpoints that handle HTTP requests/responses
- **Models**: Pydantic models for request/response validation and serialization
- **Database**: Database access layer with CRUD operations

## Key Features

1. **Standardized Response Format**: All API endpoints use a consistent `StandardResponse` model
2. **Type Safety**: Request and response data is validated using Pydantic models
3. **Exception Handling**: Consistent error handling across all endpoints
4. **Unit Tests**: Comprehensive test coverage with pytest

## Directory Structure

```
backend/
├── models/             # Pydantic models for requests/responses
│   ├── base.py         # Base models like StandardResponse
│   ├── profile.py      # Profile-specific models
│   └── ...
├── routes/             # API route definitions
│   ├── profiles_routes.py
│   └── ...
├── tests/              # Unit tests
│   ├── conftest.py     # Test fixtures
│   ├── test_profiles.py
│   └── ...
└── main.py             # Main application entry point
```

## StandardResponse Model

All API endpoints use a consistent response structure:

```json
{
  "success": true,      // boolean indicating success or failure
  "message": "...",     // human-readable message
  "data": {...},        // optional response data
  "errors": [...]       // optional list of errors
}
```

## Running the Application

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the application:
   ```
   uvicorn backend.main:app --reload
   ```

3. Run tests:
   ```
   pytest backend/tests
   ```

## API Examples

### Create a profile

```
POST /profiles/create
{
  "user_id": 1,
  "name": "Jane",
  "surname": "Doe",
  "age": 25,
  "education_level": "PhD",
  "institution": "Example University"
}
```

### Update a profile

```
PUT /profiles/update/1
{
  "name": "Updated Name",
  "education_level": "Master"
}
``` 