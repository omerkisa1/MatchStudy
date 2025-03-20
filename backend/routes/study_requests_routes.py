import sys
from fastapi import APIRouter, HTTPException

from .filePaths import myPath

sys.path.append(myPath)

from study_requests import (
    add_study_request,
    get_study_request_by_id,
    get_study_requests_by_user,
    get_all_study_requests,
    update_study_request,
    delete_study_request,
    list_user_requests

)

router = APIRouter()

@router.post("/create")
async def create_request_endpoint(user_id: int, category: str, duration: str, 
                                study_date: str, topic: str, note: str):
    try:
        add_study_request(user_id, category, duration, study_date, topic, note)
        return {"message": "Study request created successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Çalışma isteği oluşturulamadı.")

@router.get("/{request_id}")
async def get_request_endpoint(request_id: int):
    try:
        request = get_study_request_by_id(request_id)
        if request:
            return {"message": "Request found", "request": request}
        raise HTTPException(status_code=404, detail="İstek bulunamadı.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="İstek getirilemedi.")

@router.put("/update/{request_id}")
async def update_request_status_endpoint(request_id: int, status: str):
    try:
        update_study_request(request_id, status)
        return {"message": "Request status updated successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="İstek durumu güncellenemedi.")

@router.delete("/delete/{request_id}")
async def delete_request_endpoint(request_id: int):
    try:
        delete_study_request(request_id)
        return {"message": "Request deleted successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="İstek silinemedi.")

@router.get("/list")
async def list_requests_endpoint():
    try:
        requests = get_all_study_requests()
        return {"message": "Requests found", "requests": requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail="İstekler getirilemedi.")

@router.get("/user/{user_id}")
async def list_user_requests_endpoint(user_id: int):
    try:
        requests = list_user_requests(user_id)
        return {"message": "User requests found", "requests": requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Kullanıcı istekleri getirilemedi.") 