from typing import Generic, TypeVar, Optional, Any, List, Dict
from pydantic import BaseModel, Field

# Generic type for response data
T = TypeVar('T')

class StandardResponse(BaseModel, Generic[T]):
    """Standard response model for all API endpoints"""
    success: bool = Field(default=True, description="Indicates if the request was successful")
    message: str = Field(description="A descriptive message about the response")
    data: Optional[T] = Field(default=None, description="The response data")
    errors: Optional[List[str]] = Field(default=None, description="List of errors if any")
    
    @classmethod
    def success_response(cls, message: str, data: Any = None) -> "StandardResponse":
        """Create a success response"""
        return cls(success=True, message=message, data=data)
    
    @classmethod
    def error_response(cls, message: str, errors: List[str] = None) -> "StandardResponse":
        """Create an error response"""
        return cls(success=False, message=message, errors=errors or []) 