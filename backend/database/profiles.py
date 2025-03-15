from .db import get_db_connection

def add_profile(user_id, name, surname, age, education_level, institution):
    connection = get_db_connection()
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
        print(f"✅ Profil {name} {surname} başarıyla eklendi.")
    except Exception as e:
        connection.rollback()
        print(f"❌ Profil eklenirken hata oluştu: {e}")
    finally:
        cursor.close()
        connection.close()
