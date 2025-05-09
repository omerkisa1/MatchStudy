from database.config import DB_CONFIG
import mysql.connector


from database.config import DB_CONFIG
import mysql.connector

def send_friend_request(sender_id, receiver_id):
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        raise Exception("Veritabanına bağlanılamadı")

    try:
        cursor = connection.cursor()

        check_request_is_exist = """
            SELECT id FROM friend_requests
            WHERE sender_id = %s AND receiver_id = %s AND status = 'pending'
        """
        cursor.execute(check_request_is_exist, (sender_id, receiver_id))
        if cursor.fetchone():
            raise ValueError("Zaten bir arkadaşlık isteği gönderilmiş")

        insert_query = """
            INSERT INTO friend_requests (sender_id, receiver_id, status, created_at, updated_at)
            VALUES (%s, %s, 'pending', NOW(), NOW())
        """
        cursor.execute(insert_query, (sender_id, receiver_id))
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


#Bu fonksiyon önemli arkadaşlık isteği durumlarını birden fazla fonk yazarak
#kontrol edebilirdik ama tek noktadan yönetiyoruz

def manage_friend_request_status(request_id: int, receiver_id: int, new_status: str):
    valid_statuses = ['accepted', 'rejected', 'blocked']
    if new_status not in valid_statuses:
        raise ValueError("Geçersiz durum: " + new_status)

    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor()

        check_query = """
            SELECT status FROM friend_requests
            WHERE id = %s AND receiver_id = %s
        """
        cursor.execute(check_query, (request_id, receiver_id))
        row = cursor.fetchone()

        if not row:
            raise ValueError("İstek bulunamadı veya yetkiniz yok")
        if row[0] == new_status:
            raise ValueError(f"Zaten {new_status} durumda")

        update_query = """
            UPDATE friend_requests
            SET status = %s, updated_at = NOW()
            WHERE id = %s
        """
        cursor.execute(update_query, (new_status, request_id))
        connection.commit()

    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()

def get_friend_requests_by_id(user_id):
    connection = mysql.connector.connect()
    if not connection:
        return

    try: 
        cursor = connection.cursor()
        query = "SELECT * FROM friend_requests WHERE receiver_id = %s"
        cursor.execute(query,(user_id))
        connection.commit()
        print(f"Kullanıcı istekleri getirildi.")
    except Exception as e:
        connection.rollback()
        print(f"Kullanıcı istekleri getirilirken hata oluştu. {e}")
    finally:
        cursor.close()
        connection.close()
