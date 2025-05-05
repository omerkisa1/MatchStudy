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