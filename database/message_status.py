from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector
import traceback


def update_delivery_status(message_id: int, delivered: bool = False, read: bool = False):
    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor()
        fields = []
        values = []

        if delivered:
            fields.append("delivered_at = NOW()")
        if read:
            fields.append("read_at = NOW()")

        if not fields:
            return

        query = f"""
            INSERT INTO message_status (message_id, {', '.join(f.split('=')[0].strip() for f in fields)})
            VALUES (%s, {', '.join('NOW()' for _ in fields)})
            ON DUPLICATE KEY UPDATE {', '.join(fields)}
        """
        cursor.execute(query, (message_id,))
        connection.commit()
    except Exception as e:
        raise ValueError(f"Failed to update message status: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()


def mark_messages_read_by_chat(chat_id: str, user_id: int):
    """Mark all messages in a chat as read for a specific user"""
    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor()
        
        # Find all unread messages in this chat sent to this user
        query = """
            UPDATE message_status ms
            JOIN messages m ON ms.message_id = m.id
            SET ms.read_at = NOW()
            WHERE m.chat_id = %s 
            AND m.sender_id != %s 
            AND ms.read_at IS NULL
        """
        cursor.execute(query, (chat_id, user_id))
        connection.commit()
        
        return cursor.rowcount  # Number of messages marked as read
    except Exception as e:
        raise ValueError(f"Failed to mark messages as read: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()


def get_unread_counts_by_user(user_id: int):
    """Get unread message counts for each chat for a user"""
    connection = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Count unread messages by chat
        query = """
            SELECT m.chat_id, COUNT(*) as unread_count
            FROM messages m
            LEFT JOIN message_status ms ON m.id = ms.message_id
            WHERE m.sender_id != %s 
            AND (ms.read_at IS NULL)
            GROUP BY m.chat_id
        """
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()
        
        # Convert to dictionary format {chat_id: count}
        unread_counts = {row['chat_id']: row['unread_count'] for row in results}
        return unread_counts
    except Exception as e:
        raise ValueError(f"Failed to get unread counts: {e}\n{traceback.format_exc()}")
    finally:
        cursor.close()
        connection.close()