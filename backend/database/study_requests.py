from .db import get_db_connection

def add_study_request(user_id, category, duration, study_date, topic, note):
    connection = get_db_connection()
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
        print(f"✅ Çalışma isteği ({topic}) başarıyla eklendi.")
    except Exception as e:
        connection.rollback()
        print(f"❌ Çalışma isteği eklenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()
