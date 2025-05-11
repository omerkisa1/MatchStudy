from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector
import traceback


def create_chat(user_1_id: int, user_2_id: int, chat_id: str):
    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO chats (chat_id, user_1_id, user_2_id)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE chat_id = chat_id
        """
        cursor.execute(query, (chat_id, user_1_id, user_2_id))
        connection.commit()
    except Exception as e:
        if connection.is_connected():
            connection.rollback()
        raise ValueError(f"Failed to create chat: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()


def get_chat_id(user_1_id: int, user_2_id: int):
    # Kullanıcı ID'lerini sıralayıp sabit bir chat_id oluştur
    smaller_id = min(user_1_id, user_2_id)
    larger_id = max(user_1_id, user_2_id)
    return f"{smaller_id}_{larger_id}"
