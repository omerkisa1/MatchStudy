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
    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT chat_id FROM chats
            WHERE (user_1_id = %s AND user_2_id = %s)
               OR (user_1_id = %s AND user_2_id = %s)
        """
        cursor.execute(query, (user_1_id, user_2_id, user_2_id, user_1_id))
        result = cursor.fetchone()
        return result['chat_id'] if result else None
    except Exception as e:
        raise ValueError(f"Failed to fetch chat: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()
