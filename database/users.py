from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector
from typing import Optional


def add_user(email, password,name,surname,age,education_level):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = "INSERT INTO users (email, password,name,surname,age,education_level, created_at,updated_at) VALUES (%s, %s,%s,%s,%s,%s, NOW(), NOW())"
        cursor.execute(query, (email, password,name,surname,age,education_level))
        connection.commit()
        print(f"Kullanıcı {email} başarıyla eklendi.")
    except Exception as e:
        connection.rollback()
        print(f"Kullanıcı eklenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

#add_user("seher@example.com","123456","Seher","Akyel","20","Lisans")

def get_user_by_id(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()
        print(user)
        return user
    except Exception as e:
        print(f" Kullanıcı getirilemedi: {e}")
        return None
    finally:
        cursor.close()
        connection.close()
get_user_by_id(1)

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
    
def update_user(user_id: int,email: Optional[str] = None,password: Optional[str] = None,name: Optional[str] = None,surname: Optional[str] = None,age: Optional[int] = None,education_level: Optional[str] = None):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()

        data = {
            "email": email,
            "password": password,
            "name": name,
            "surname": surname,
            "age": age,
            "education_level": education_level
        }

        fields = [f"{key} = %s" for key, value in data.items() if value is not None]
        values = [value for value in data.values() if value is not None]

        if not fields:
            raise ValueError("Güncellenecek alan yok.")

        fields.append("updated_at = NOW()")

        query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
        values.append(user_id)

        cursor.execute(query, values)
        connection.commit()
        print(f"Kullanıcı {user_id} başarıyla güncellendi.")

    except Exception as e:
        connection.rollback()
        print(f"Hata: {e}")
    finally:
        cursor.close()
        connection.close()


