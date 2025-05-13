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
import traceback

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

# Veritabanı bağlantısı için yardımcı fonksiyon
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

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
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Tam kullanıcı bilgilerini al - Profil tablosuna daha güvenli bir join
        cursor.execute("""
                SELECT 
                    u.id,
                    u.email,
                    u.name,
                    u.surname,
                    u.age,
                    u.education_level,
                    u.created_at,
                    u.updated_at,
                    p.bio,
                    p.institution,
                    COUNT(m.id) AS message_count
                FROM users u
                LEFT JOIN profiles p ON u.id = p.user_id
                LEFT JOIN messages m ON u.id = m.sender_id
                GROUP BY 
                    u.id, u.email, u.name, u.surname, u.age, u.education_level, 
                    u.created_at, u.updated_at, p.bio, p.institution;
                    """)
        
        users = cursor.fetchall()
        cursor.close()
        connection.close()
        
        # MySQL datetime objelerini seri hale getirilebilir formata dönüştür
        for user in users:
            for key, value in user.items():
                if isinstance(value, datetime.datetime) or isinstance(value, datetime.date):
                    user[key] = value.isoformat()
        
        logger.info(f"Users list fetched by admin: {username}, count: {len(users)}")
        return {"success": True, "users": users}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error fetching users: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": "Kullanıcı listesi alınırken bir hata oluştu."}

# Sohbetler listesi
@router.get("/chats", response_class=JSONResponse)
async def get_chats(username: str = Depends(verify_admin)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Düzeltilmiş sorgu - chat_id kullan id yerine
        cursor.execute("""
            SELECT c.chat_id, c.user_1_id, c.user_2_id, c.created_at, c.updated_at,
                   u1.name AS user_1_name, u1.email AS user_1_email,
                   u2.name AS user_2_name, u2.email AS user_2_email,
                   (SELECT COUNT(*) FROM messages WHERE chat_id = c.chat_id) as message_count,
                   (SELECT MAX(sent_at) FROM messages WHERE chat_id = c.chat_id) as last_message_date
            FROM chats c
            JOIN users u1 ON c.user_1_id = u1.id
            JOIN users u2 ON c.user_2_id = u2.id
            ORDER BY c.updated_at DESC
        """)
        
        chats = cursor.fetchall()
        cursor.close()
        connection.close()
        
        # MySQL datetime objelerini seri hale getirilebilir formata dönüştür
        for chat in chats:
            for key, value in chat.items():
                if isinstance(value, datetime.datetime) or isinstance(value, datetime.date):
                    chat[key] = value.isoformat()
        
        logger.info(f"Chats list fetched by admin: {username}, count: {len(chats)}")
        return {"success": True, "chats": chats}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error fetching chats: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": "Sohbet listesi alınırken bir hata oluştu."}

# Belirli bir sohbetin mesajları
@router.get("/messages/{chat_id}", response_class=JSONResponse)
async def get_chat_messages(chat_id: str, username: str = Depends(verify_admin)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Belirtilen sohbetin mesajlarını al
        cursor.execute("""
            SELECT m.id, m.chat_id, m.sender_id, m.content, m.sent_at, 
                   u.name AS sender_name, u.email AS sender_email
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.chat_id = %s
            ORDER BY m.sent_at ASC
        """, (chat_id,))
        
        messages = cursor.fetchall()
        cursor.close()
        connection.close()
        
        # MySQL datetime objelerini seri hale getirilebilir formata dönüştür
        for message in messages:
            for key, value in message.items():
                if isinstance(value, datetime.datetime) or isinstance(value, datetime.date):
                    message[key] = value.isoformat()
        
        logger.info(f"Messages for chat {chat_id} fetched by admin: {username}, count: {len(messages)}")
        return {"success": True, "messages": messages}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error fetching messages for chat {chat_id}: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": f"Sohbet {chat_id} için mesajlar alınırken bir hata oluştu."}

# Sistem genel istatistikleri
@router.get("/stats", response_class=JSONResponse)
async def get_system_stats(username: str = Depends(verify_admin)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        stats = {}
        
        # Kullanıcı sayısı
        cursor.execute("SELECT COUNT(*) as count FROM users")
        stats["user_count"] = cursor.fetchone()["count"]
        
        # Toplam mesaj sayısı
        cursor.execute("SELECT COUNT(*) as count FROM messages")
        stats["message_count"] = cursor.fetchone()["count"]
        
        # Aktif sohbet sayısı
        cursor.execute("SELECT COUNT(*) as count FROM chats")
        stats["chat_count"] = cursor.fetchone()["count"]
        
        # Son 7 gündeki mesaj sayısı
        cursor.execute("""
            SELECT COUNT(*) as count FROM messages 
            WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        stats["recent_messages"] = cursor.fetchone()["count"]
        
        # Aylık mesaj istatistikleri (son 6 ay)
        try:
            cursor.execute("""
                SELECT 
                    DATE_FORMAT(sent_at, '%Y-%m') as month,
                    COUNT(*) as count
                FROM messages
                WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(sent_at, '%Y-%m')
                ORDER BY month
            """)
            monthly_stats = cursor.fetchall()
            stats["monthly_messages"] = [
                {"month": row["month"], "count": row["count"]} for row in monthly_stats
            ]
        except Exception as monthly_err:
            logger.warning(f"Error fetching monthly stats: {str(monthly_err)}")
            stats["monthly_messages"] = []
        
        # Günlük aktif kullanıcı sayısı (son 30 gün)
        try:
            cursor.execute("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(DISTINCT id) as count
                FROM users
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date
            """)
            daily_users = cursor.fetchall()
            stats["daily_active_users"] = [
                {"date": row["date"].isoformat(), "count": row["count"]} for row in daily_users
            ]
        except Exception as daily_err:
            logger.warning(f"Error fetching daily user stats: {str(daily_err)}")
            stats["daily_active_users"] = []
        
        cursor.close()
        connection.close()
        
        logger.info(f"System stats fetched by admin: {username}")
        return {"success": True, "stats": stats}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error fetching system stats: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": "Sistem istatistikleri alınırken bir hata oluştu."}

# Sistem loglarını görüntüleme
@router.get("/logs", response_class=JSONResponse)
async def get_system_logs(limit: int = 100, username: str = Depends(verify_admin)):
    try:
        log_file = os.path.join(log_directory, 'admin_panel.log')
        if not os.path.exists(log_file):
            logger.warning(f"Log file {log_file} does not exist")
            return {"success": True, "logs": []}
            
        with open(log_file, 'r', encoding='utf-8') as f:
            logs = f.readlines()
        
        # Son log kayıtlarını al
        logs = logs[-limit:] if len(logs) > limit else logs
        
        logger.info(f"System logs fetched by admin: {username}, count: {len(logs)}")
        return {"success": True, "logs": logs}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error fetching system logs: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": "Sistem logları alınırken bir hata oluştu."}

# Kullanıcı silme
@router.delete("/users/{user_id}", response_class=JSONResponse)
async def delete_user(user_id: int, username: str = Depends(verify_admin)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # İlk olarak kullanıcının var olduğunu kontrol et
        cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            logger.warning(f"Admin {username} attempted to delete non-existent user with ID {user_id}")
            return {"success": False, "message": f"Kullanıcı {user_id} bulunamadı."}
            
        # İlişkili tüm verileri silmek için transaction başlat
        connection.start_transaction()
        
        try:
            # İlişkili verileri sil
            # Sıralama önemli - önce bağımlı tablolar, sonra ana tablolar
            cursor.execute("DELETE FROM user_interests WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM message_status WHERE message_id IN (SELECT id FROM messages WHERE sender_id = %s)", (user_id,))
            cursor.execute("DELETE FROM messages WHERE sender_id = %s", (user_id,))
            
            # Kullanıcının olduğu sohbetleri bul ve sil
            cursor.execute("""
                SELECT chat_id FROM chats 
                WHERE user_1_id = %s OR user_2_id = %s
            """, (user_id, user_id))
            
            chat_ids = cursor.fetchall()
            for chat_row in chat_ids:
                chat_id = chat_row[0]
                # İlgili sohbetteki tüm mesajları sil
                cursor.execute("DELETE FROM messages WHERE chat_id = %s", (chat_id,))
            
            cursor.execute("DELETE FROM chats WHERE user_1_id = %s OR user_2_id = %s", (user_id, user_id))
            cursor.execute("DELETE FROM friend_requests WHERE sender_id = %s OR receiver_id = %s", (user_id, user_id))
            cursor.execute("DELETE FROM matches WHERE requester_id = %s OR responder_id = %s", (user_id, user_id))
            cursor.execute("DELETE FROM study_requests WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM profiles WHERE user_id = %s", (user_id,))
            
            # Son olarak kullanıcıyı sil
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            
            # Değişiklikleri kaydet
            connection.commit()
            
            logger.info(f"User {user_id} successfully deleted by admin: {username}")
            return {"success": True, "message": f"Kullanıcı {user_id} başarıyla silindi."}
            
        except Exception as inner_e:
            # Hata durumunda rollback yap
            connection.rollback()
            error_details = traceback.format_exc()
            logger.error(f"Transaction error when deleting user {user_id}: {str(inner_e)}\n{error_details}")
            return {"success": False, "error": str(inner_e), "message": f"İşlem sırasında hata oluştu: {str(inner_e)}"}
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error deleting user {user_id}: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": f"Kullanıcı {user_id} silinirken bir hata oluştu."}

# Yeni admin paneli için API durumunu kontrol et
@router.get("/api-status", response_class=JSONResponse)
async def get_api_status(username: str = Depends(verify_admin)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Veritabanına bağlantı kontrolü
        cursor.execute("SELECT 1")
        cursor.fetchone()
        
        # Tablo sayılarını al - hata almaması için try/except içine al
        table_counts = {}
        for table in ['users', 'chats', 'messages', 'profiles', 'study_requests', 'matches', 'friend_requests']:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                table_counts[table] = count
            except Exception as table_err:
                table_counts[table] = f"Error: {str(table_err)}"
        
        cursor.close()
        connection.close()
        
        server_time = datetime.datetime.now()
        
        # Windows'ta uptime komutu çalışmayacağı için
        try:
            uptime = os.popen('uptime').read().strip() if os.name != 'nt' else "Windows'ta desteklenmiyor"
        except:
            uptime = "Alınamadı"
        
        logger.info(f"API status checked by admin: {username}")
        return {
            "success": True, 
            "status": "online", 
            "db_connection": "active",
            "server_time": server_time.isoformat(),
            "uptime": uptime,
            "table_counts": table_counts
        }
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"API status check failed: {str(e)}\n{error_details}")
        return {
            "success": False, 
            "status": "error", 
            "db_connection": "error",
            "server_time": datetime.datetime.now().isoformat(),
            "error": str(e)
        } 

@router.post("/client-info")
async def log_client_info(info: Dict[str, Any]):
    logger.info(f"[CLIENT-INFO] {json.dumps(info, ensure_ascii=False)}")
    return {"success": True}

@router.post("/client-logs")
async def receive_client_log(log_data: dict):
    try:
        log_entry = f"[CLIENT LOG] {log_data}"
        logger.info(log_entry)
        return {"success": True, "message": "Log kaydedildi"}
    except Exception as e:
        logger.error(f"Client log hatası: {str(e)}")
        return {"success": False, "message": "Log kaydedilirken hata oluştu"}

# Kullanıcı detaylarını görüntüleme
@router.get("/users/{user_id}", response_class=JSONResponse)
async def get_user_details(user_id: int, username: str = Depends(verify_admin)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Kullanıcı bilgilerini al
        cursor.execute("""
            SELECT 
                u.id, u.email, u.name, u.surname, u.age, u.education_level,
                u.created_at, u.updated_at, u.last_seen,
                (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) AS message_count
            FROM users u
            WHERE u.id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return {"success": False, "message": f"Kullanıcı {user_id} bulunamadı."}
        
        # MySQL datetime objelerini seri hale getirilebilir formata dönüştür
        for key, value in user.items():
            if isinstance(value, datetime.datetime) or isinstance(value, datetime.date):
                user[key] = value.isoformat()
        
        # Kullanıcının profil bilgilerini al
        cursor.execute("""
            SELECT bio, institution
            FROM profiles
            WHERE user_id = %s
        """, (user_id,))
        
        profile = cursor.fetchone()
        user["profile"] = profile or {}
        
        cursor.close()
        connection.close()
        
        logger.info(f"Admin {username} kullanıcı detaylarını görüntüledi: {user_id}")
        return {"success": True, "user": user}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Kullanıcı detaylarını alma hatası {user_id}: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": f"Kullanıcı detayları alınırken bir hata oluştu."}

# Kullanıcı güncelleme
@router.put("/users/{user_id}", response_class=JSONResponse)
async def update_user(user_id: int, user_data: dict, username: str = Depends(verify_admin)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Kullanıcının varlığını kontrol et
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            return {"success": False, "message": f"Kullanıcı {user_id} bulunamadı."}
        
        # Transaction başlat
        connection.start_transaction()
        
        try:
            # Ana kullanıcı bilgilerini güncelle
            update_fields = []
            update_values = []
            
            if "name" in user_data:
                update_fields.append("name = %s")
                update_values.append(user_data["name"])
            
            if "surname" in user_data:
                update_fields.append("surname = %s")
                update_values.append(user_data["surname"])
            
            if "email" in user_data:
                update_fields.append("email = %s")
                update_values.append(user_data["email"])
            
            if "age" in user_data:
                update_fields.append("age = %s")
                update_values.append(user_data.get("age") or None)
            
            if "education_level" in user_data:
                update_fields.append("education_level = %s")
                update_values.append(user_data.get("education_level") or None)
            
            # Güncelleme zamanını ekle
            update_fields.append("updated_at = %s")
            update_values.append(datetime.datetime.now())
            
            # Kullanıcı kimliğini sorgu için ekle
            update_values.append(user_id)
            
            if update_fields:
                query = f"UPDATE users SET {', '.join(update_fields)}, updated_at = NOW() WHERE id = %s"
                cursor.execute(query, update_values)
            
            # Profil bilgilerini güncelle
            if "bio" in user_data or "institution" in user_data:
                # Önce profil var mı kontrol et
                cursor.execute("SELECT user_id FROM profiles WHERE user_id = %s", (user_id,))
                profile_exists = cursor.fetchone()
                
                if profile_exists:
                    # Var olan profili güncelle
                    profile_fields = []
                    profile_values = []
                    
                    if "bio" in user_data:
                        profile_fields.append("bio = %s")
                        profile_values.append(user_data.get("bio") or None)
                    
                    if "institution" in user_data:
                        profile_fields.append("institution = %s")
                        profile_values.append(user_data.get("institution") or None)
                    
                    profile_values.append(user_id)
                    
                    if profile_fields:
                        query = f"UPDATE profiles SET {', '.join(profile_fields)}, updated_at = NOW() WHERE user_id = %s"
                        cursor.execute(query, profile_values)
                else:
                    # Yeni profil oluştur
                    cursor.execute(
                        "INSERT INTO profiles (user_id, bio, institution, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",
                        (user_id, user_data.get("bio"), user_data.get("institution"))
                    )
            
            # İşlemi kaydet
            connection.commit()
            logger.info(f"Admin {username} tarafından kullanıcı güncellendi: {user_id}")
            return {"success": True, "message": f"Kullanıcı {user_id} başarıyla güncellendi."}
            
        except Exception as inner_e:
            # Hata durumunda geri al
            connection.rollback()
            error_details = traceback.format_exc()
            logger.error(f"Kullanıcı güncelleme hatası {user_id}: {str(inner_e)}\n{error_details}")
            return {"success": False, "error": str(inner_e), "message": f"Kullanıcı güncellenirken hata oluştu: {str(inner_e)}"}
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Kullanıcı güncelleme erişim hatası {user_id}: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "message": f"Kullanıcı güncellenirken erişim hatası oluştu."}
