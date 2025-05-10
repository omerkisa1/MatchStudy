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

def manage_friend_request_status(sender_id: int, receiver_id: int, new_status: str):
    valid_statuses = ['accepted', 'rejected', 'blocked']
    if new_status not in valid_statuses:
        raise ValueError("Geçersiz durum: " + new_status)

    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor()

        check_query = """
            SELECT status FROM friend_requests
            WHERE sender_id = %s AND receiver_id = %s
        """
        cursor.execute(check_query, (sender_id, receiver_id))
        row = cursor.fetchone()

        if not row:
            raise ValueError("İstek bulunamadı veya yetkiniz yok")
        if row[0] == new_status:
            raise ValueError(f"Zaten {new_status} durumda")

        update_query = """
            UPDATE friend_requests
            SET status = %s, updated_at = NOW()
            WHERE sender_id = %s AND receiver_id = %s
        """
        cursor.execute(update_query, (new_status, sender_id, receiver_id))
        connection.commit()

    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()

def get_friend_requests_by_id(user_id):
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT fr.*, u.name AS sender_name, u.surname AS sender_surname, u.age AS sender_age, u.education_level AS sender_education_level
            FROM friend_requests fr
            JOIN users u ON fr.sender_id = u.id
            WHERE fr.receiver_id = %s
        """
        cursor.execute(query, (user_id,))
        requests = cursor.fetchall()
        return requests
    except Exception as e:
        print(f"Kullanıcı istekleri getirilirken hata oluştu: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        

def get_friend_list_by_id(user_id):
    connection = mysql.connector.connect(**DB_CONFIG)

    try:
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT 
            fr.id AS receiver_id,
            fr.status,
            fr.created_at,
            fr.updated_at,

            u.id AS user_id,
            u.name,
            u.surname,
            u.age,
            u.education_level,
            u.email

        FROM friend_requests fr
        JOIN users u 
            ON (
                (fr.sender_id = %s AND fr.receiver_id = u.id)
                OR
                (fr.receiver_id = %s AND fr.sender_id = u.id)
            )
        WHERE fr.status = 'accepted'
        ORDER BY fr.created_at DESC;
        """

        cursor.execute(query, (user_id, user_id))
        results = cursor.fetchall()
        return results

    except Exception as e:
        print(f"Hata oluştu: {e}")
        return []
    finally:
        cursor.close()
        connection.close()
if __name__ == "__main__":
    user_id = 1  # test etmek istediğin kullanıcı ID'sini buraya yaz
    results = get_friend_requests_by_id(user_id)
    for r in results:
        print(r)
