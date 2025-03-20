from config import DB_CONFIG
from mysql.connector import Error
import mysql.connector

def add_match(request_id, requester_id, responder_id, status):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO matches (request_id, requester_id, responder_id, status, matched_at)
            VALUES (%s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (request_id, requester_id, responder_id, status))
        connection.commit()
        print(f"Eşleşme {request_id} başarıyla eklendi.")
    except Exception as e:
        connection.rollback()
        print(f"Eşleşme eklenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()

def get_match_by_id(match_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = "SELECT * FROM matches WHERE id = %s"
        cursor.execute(query, (match_id,))
        request = cursor.fetchall()
        return request
    except Exception as e:
        print(f"Eşleşme getirilemedi: {e}")
        return None
    
def get_matches_by_requester_id(requester_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = "SELECT * FROM matches WHERE requester_id = %s"
        cursor.execute(query, (requester_id,))
        request = cursor.fetchall()
        return request
    except Exception as e:
        print(f"Dbden veri gelmedi. {e}")
        return None

def get_matches_by_responder_id(responder_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = "SELECT * FROM matches WHERE responder_id = %s"
        cursor.execute(query, (responder_id,))
        request = cursor.fetchall()
        return request
    except Exception as e:
        print(f"Dbden veri gelmedi. {e}")
        return None


def update_match_status(match_id, status):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = "UPDATE matches SET status = %s WHERE id = %s"
        cursor.execute(query, (status, match_id))
        connection.commit()
        print(f"Eşleşme {match_id} başarıyla güncellendi.")
    except Exception as e:
        connection.rollback()
        print(f"güncelleme hatası: {e}")
    finally:
        cursor.close()
        connection.close()

def delete_match(match_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = "DELETE FROM matches WHERE id = %s"
        cursor.execute(query, (match_id,))
        connection.commit()
        print(f"Eşleşme {match_id} başarıyla silindi.")
    except Exception as e:
        connection.rollback()
        print(f"Silme hatası: {e}")
    finally:
        cursor.close()
        connection.close()