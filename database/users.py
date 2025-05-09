from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector


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
    
#login_user("test@example.com", "123")

def update_user_profile(user_id, name=None, surname=None, age=None, education_level=None, bio=None, institution=None):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        
        # Önce kullanıcının var olup olmadığını kontrol edelim
        check_query = "SELECT id FROM users WHERE id = %s"
        cursor.execute(check_query, (user_id,))
        if not cursor.fetchone():
            return False  # Kullanıcı bulunamadı
        
        # Güncellenecek alanları belirle
        updates = []
        params = []
        
        if name is not None:
            updates.append("name = %s")
            params.append(name)
        
        if surname is not None:
            updates.append("surname = %s")
            params.append(surname)
        
        if age is not None:
            updates.append("age = %s")
            params.append(age)
        
        if education_level is not None:
            updates.append("education_level = %s")
            params.append(education_level)
        
        if bio is not None:
            # bio alanının tabloda var olduğundan emin olmak gerekir
            updates.append("bio = %s")
            params.append(bio)
        
        if institution is not None:
            # institution alanının tabloda var olduğundan emin olmak gerekir
            updates.append("institution = %s")
            params.append(institution)
        
        if not updates:  # Güncelleme yoksa
            return True
        
        updates.append("updated_at = NOW()")
        
        # SQL sorgusunu oluştur
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        params.append(user_id)
        
        cursor.execute(query, params)
        connection.commit()
        
        return True
    except Exception as e:
        connection.rollback()
        print(f"Kullanıcı profili güncellenirken hata oluştu: {e}")
        raise e
    finally:
        cursor.close()
        connection.close()


