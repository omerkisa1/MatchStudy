from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector
import traceback


def save_message(chat_id: str, sender_id: int, content: str):
    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO messages (chat_id, sender_id, content)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (chat_id, sender_id, content))
        message_id = cursor.lastrowid
        connection.commit()
        return message_id
    except Exception as e:
        if connection.is_connected():
            connection.rollback()
        raise ValueError(f"Failed to save message: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()


def get_messages_by_chat(chat_id: str):
    connection = mysql.connector.connect(**DB_CONFIG)()
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT * FROM messages
            WHERE chat_id = %s
            ORDER BY sent_at ASC
        """
        cursor.execute(query, (chat_id,))
        return cursor.fetchall()
    except Exception as e:
        raise ValueError(f"Failed to fetch messages: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()


def mark_message_read(message_id: int):
    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor()
        query = """
            UPDATE messages SET is_read = TRUE WHERE id = %s
        """
        cursor.execute(query, (message_id,))
        connection.commit()
    except Exception as e:
        raise ValueError(f"Failed to mark message read: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()