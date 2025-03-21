from config import DB_CONFIG
from mysql.connector import Error
import mysql.connector

def add_study_request(user_id, category, duration, study_date, topic, note):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO study_requests (user_id, category, duration, study_date, topic, note, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (user_id, category, duration, study_date, topic, note))
        connection.commit()
        print(f" Çalışma isteği ({topic}) başarıyla eklendi.")
    except Exception as e:
        connection.rollback()
        print(f"Çalışma isteği eklenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

def get_study_request_by_id(request_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM study_requests WHERE id = %s"
        cursor.execute(query, (request_id,))
        request = cursor.fetchone()
        return request
    except Exception as e:
        print(f"Çalışma isteği getirilemedi: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

def get_study_requests_by_user(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM study_requests WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        requests = cursor.fetchall()
        return requests
    except Exception as e:
        print(f"Kullanıcının çalışma istekleri getirilemedi: {e}")
        return []
    finally:
        cursor.close()
        connection.close()

def get_all_study_requests():
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM study_requests"
        cursor.execute(query)
        requests = cursor.fetchall()
        return requests
    except Exception as e:
        print(f" Tüm çalışma istekleri getirilemedi: {e}")
        return []
    finally:
        cursor.close()
        connection.close()

def update_study_request(request_id, category, duration, study_date, topic, note):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = """
            UPDATE study_requests
            SET category = %s, duration = %s, study_date = %s, topic = %s, note = %s
            WHERE id = %s
        """
        cursor.execute(query, (category, duration, study_date, topic, note, request_id))
        connection.commit()
        print(f"Çalışma isteği ({request_id}) başarıyla güncellendi.")
    except Exception as e:
        connection.rollback()
        print(f"Çalışma isteği güncellenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()


def delete_study_request(request_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = "DELETE FROM study_requests WHERE id = %s"
        cursor.execute(query, (request_id,))
        connection.commit()
        print(f"Çalışma isteği ({request_id}) başarıyla silindi.")
    except Exception as e:
        connection.rollback()
        print(f"Çalışma isteği silinirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

def list_user_requests(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM study_requests WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        requests = cursor.fetchall()
        return requests
    except Exception as e:
        print(f"Kullanıcı istekleri getirilemedi: {e}")
        return []
    finally:
        cursor.close()
        connection.close()
