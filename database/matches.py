from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector

def add_match(requester_id, responder_id, request_id):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM matches 
        WHERE requester_id = %s AND responder_id = %s AND request_id = %s
    """, (requester_id, responder_id, request_id))
    existing = cursor.fetchone()

    if existing:
        if existing["status"] == "pending":
            raise ValueError("Zaten istek gönderilmiş.")
        elif existing["status"] == "accepted":
            raise ValueError("Zaten eşleştiniz.")
        elif existing["status"] == "rejected":
            pass

    cursor.execute("""
        INSERT INTO matches (request_id, requester_id, responder_id, status)
        VALUES (%s, %s, %s, %s)
    """, (request_id, requester_id, responder_id, "pending"))
    
    conn.commit()
    conn.close()

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

def list_macthes():
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = "SELECT * FROM matches"
        cursor.execute(query)
        matches = cursor.fetchall()
        return matches
    except Exception as e:
        print(f"Dbden veri gelmedi. {e}")
        return None
    
def get_matches_for_responder(user_id):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM matches WHERE responder_id = %s AND status = 'pending'"
    cursor.execute(query, (user_id,))
    results = cursor.fetchall()
    print("Bildirimler:", results) 
    cursor.close()
    conn.close()
    return results
