from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import mysql.connector
import os
import secrets
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from database.config import DB_CONFIG
import logging
import datetime
import json

# Temel güvenlik için
security = HTTPBasic()
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"  # Gerçek uygulamada güvenli bir şifre ve çevresel değişkenlerden alınmalı

# Router oluştur
router = APIRouter()

# Log klasörü kontrolü ve oluşturma
log_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

# Logger ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_directory, 'admin_panel.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("admin_panel")

# Template dizini için ayarlar
templates_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
templates = Jinja2Templates(directory=templates_directory)

# Güvenlik kontrolü için fonksiyon
def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    
    if not (correct_username and correct_password):
        logger.warning(f"Failed login attempt with username: {credentials.username}")
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    logger.info(f"Admin login successful: {credentials.username}")
    return credentials.username

# Ana admin paneli
@router.get("/", response_class=HTMLResponse)
async def admin_panel(request: Request, username: str = Depends(verify_admin)):
    logger.info(f"Admin panel accessed by: {username}")
    return templates.TemplateResponse("admin.html", {"request": request, "username": username})

# Kullanıcılar listesi
@router.get("/users", response_class=JSONResponse)
async def get_users(username: str = Depends(verify_admin)):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        cursor.close()
        connection.close()
        logger.info(f"Users list fetched by admin: {username}")
        return {"success": True, "users": users}
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Sohbetler listesi
@router.get("/chats", response_class=JSONResponse)
async def get_chats(username: str = Depends(verify_admin)):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.*, 
                   u1.name AS user_1_name, u1.email AS user_1_email,
                   u2.name AS user_2_name, u2.email AS user_2_email 
            FROM chats c
            JOIN users u1 ON c.user_1_id = u1.id
            JOIN users u2 ON c.user_2_id = u2.id
        """)
        chats = cursor.fetchall()
        cursor.close()
        connection.close()
        logger.info(f"Chats list fetched by admin: {username}")
        return {"success": True, "chats": chats}
    except Exception as e:
        logger.error(f"Error fetching chats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Belirli bir sohbetin mesajları
@router.get("/messages/{chat_id}", response_class=JSONResponse)
async def get_chat_messages(chat_id: str, username: str = Depends(verify_admin)):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT m.*, u.name AS sender_name, u.email AS sender_email
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.chat_id = %s
            ORDER BY m.sent_at DESC
        """, (chat_id,))
        messages = cursor.fetchall()
        cursor.close()
        connection.close()
        logger.info(f"Messages for chat {chat_id} fetched by admin: {username}")
        return {"success": True, "messages": messages}
    except Exception as e:
        logger.error(f"Error fetching messages for chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Sistem genel istatistikleri
@router.get("/stats", response_class=JSONResponse)
async def get_system_stats(username: str = Depends(verify_admin)):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Kullanıcı sayısı
        cursor.execute("SELECT COUNT(*) as count FROM users")
        user_count = cursor.fetchone()["count"]
        
        # Toplam mesaj sayısı
        cursor.execute("SELECT COUNT(*) as count FROM messages")
        message_count = cursor.fetchone()["count"]
        
        # Aktif sohbet sayısı
        cursor.execute("SELECT COUNT(*) as count FROM chats")
        chat_count = cursor.fetchone()["count"]
        
        # Son 7 gündeki mesaj sayısı
        cursor.execute("""
            SELECT COUNT(*) as count FROM messages 
            WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        recent_messages = cursor.fetchone()["count"]
        
        cursor.close()
        connection.close()
        
        stats = {
            "user_count": user_count,
            "message_count": message_count,
            "chat_count": chat_count,
            "recent_messages": recent_messages
        }
        
        logger.info(f"System stats fetched by admin: {username}")
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Error fetching system stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Sistem loglarını görüntüleme
@router.get("/logs", response_class=JSONResponse)
async def get_system_logs(limit: int = 100, username: str = Depends(verify_admin)):
    try:
        log_file = os.path.join(log_directory, 'admin_panel.log')
        if not os.path.exists(log_file):
            return {"success": True, "logs": []}
            
        with open(log_file, 'r') as f:
            logs = f.readlines()
        
        # Son log kayıtlarını al
        logs = logs[-limit:] if len(logs) > limit else logs
        
        logger.info(f"System logs fetched by admin: {username}")
        return {"success": True, "logs": logs}
    except Exception as e:
        logger.error(f"Error fetching system logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Kullanıcı silme
@router.delete("/users/{user_id}", response_class=JSONResponse)
async def delete_user(user_id: int, username: str = Depends(verify_admin)):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info(f"User {user_id} deleted by admin: {username}")
        return {"success": True, "message": f"User {user_id} deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Yeni admin paneli için API durumunu kontrol et
@router.get("/api-status", response_class=JSONResponse)
async def get_api_status(username: str = Depends(verify_admin)):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Veritabanına bağlantı kontrolü
        cursor.execute("SELECT 1")
        cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        logger.info(f"API status checked by admin: {username}")
        return {
            "success": True, 
            "status": "online", 
            "db_connection": "active",
            "server_time": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"API status check failed: {str(e)}")
        return {
            "success": False, 
            "status": "error", 
            "db_connection": "error",
            "server_time": datetime.datetime.now().isoformat(),
            "error": str(e)
        } 