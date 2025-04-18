from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector
def add_profile(user_id, name, surname, age, education_level, institution):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO profiles (user_id, name, surname, age, education_level, institution, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (user_id, name, surname, age, education_level, institution))
        connection.commit()
        print(f"Profil {name} {surname} başarıyla eklendi.")
    except Exception as e:
        connection.rollback()
        print(f"Profil eklenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

def get_profile_by_user_id(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM profiles WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        profile = cursor.fetchone()
        return profile
    except Exception as e:
        print(f" Profil getirilemedi: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

def update_profile(user_id, name, surname, age, education_level, institution):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = """
            UPDATE profiles
            SET name = %s, surname = %s, age = %s, education_level = %s, institution = %s, updated_at = NOW()
            WHERE user_id = %s
        """
        cursor.execute(query, (name, surname, age, education_level, institution, user_id))
        connection.commit()
        print(f"Profil başarıyla güncellendi.")
    except Exception as e:
        connection.rollback()
        print(f"Profil güncellenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

def delete_profile_by_user_id(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = "DELETE FROM profiles WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        connection.commit()
        print(" Profil başarıyla silindi.")
    except Exception as e:
        connection.rollback()
        print(f" Profil silinirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

def list_profiles():
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM profiles"
        cursor.execute(query)
        profiles = cursor.fetchall()
        return profiles
    except Exception as e:
        print(f"Profiller getirilemedi: {e}")
        return []
    finally:
        cursor.close()
        connection.close()