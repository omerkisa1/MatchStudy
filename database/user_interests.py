from database.config import DB_CONFIG
import traceback
import mysql.connector

def add_interest(user_id: int, interest: str):
    """Add a new interest for a user."""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        raise ValueError("Database connection error")

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO user_interests (user_id, interest, created_at)
            VALUES (%s, %s, NOW())
        """
        cursor.execute(query, (user_id, interest))
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise ValueError(f"Failed to add interest: {e}")
    finally:
        cursor.close()
        connection.close()

def delete_interest(user_id: int, interest: str):
    """Delete a specific interest of a user."""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        raise ValueError("Database connection error")

    try:
        cursor = connection.cursor()
        query = "DELETE FROM user_interests WHERE user_id = %s AND interest = %s"
        cursor.execute(query, (user_id, interest))
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise ValueError(f"Failed to delete interest: {e}")
    finally:
        cursor.close()
        connection.close()

def get_interests_by_user(user_id: int):
    """Get all interests of a user as a list of strings."""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT interest FROM user_interests WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()
        return [row['interest'] for row in result]
    except Exception:
        return []
    finally:
        cursor.close()
        connection.close()
