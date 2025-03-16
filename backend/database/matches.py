from .db import get_db_connection

def add_match(request_id, requester_id, responder_id, status):
    connection = get_db_connection()
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
    connection = get_db_connection()
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
    