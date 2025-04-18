from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector


def add_user(email, password):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = "INSERT INTO users (email, password, created_at) VALUES (%s, %s, NOW())"
        cursor.execute(query, (email, password))
        connection.commit()
        print(f"Kullanıcı {email} başarıyla eklendi.")
    except Exception as e:
        connection.rollback()
        print(f"Kullanıcı eklenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

def get_user_by_id(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()
        return user
    except Exception as e:
        print(f" Kullanıcı getirilemedi: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

def list_users():
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM users"
        cursor.execute(query)
        users = cursor.fetchall()
        #print(users)
        return users
    except Exception as e:
        print(f"Kullanıcılar getirilemedi: {e}")
        return []
    finally:
        cursor.close()
        connection.close()


def delete_user_by_id(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = "DELETE FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        connection.commit()
        print(f"Kullanıcı başarıyla silindi.")
    except Exception as e:
        connection.rollback()
        print(f"Kullanıcı silinirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()


def login_user(email: str, password: str) -> bool:
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM users WHERE email = %s AND password = %s"
        cursor.execute(query, (email, password))
        user = cursor.fetchone()
        return True if user else False
    except Exception as e:
        print(f" Kullanıcı getirilemedi: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

def get_user_id(email: str, password: str):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT id FROM users WHERE email = %s AND password = %s"
        cursor.execute(query, (email, password))
        user = cursor.fetchone()
        return user["id"] if user else None
    except Exception as e:
        print(f" Kullanıcı getirilemedi: {e}")
        return None
    finally:
        cursor.close()
        connection.close()
    
login_user("test@example.com", "123")