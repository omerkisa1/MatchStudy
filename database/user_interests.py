from database.config import get_connection, logger
import traceback

def add_interest(user_id: int, interest: str):
    connection = get_connection()
    if not connection:
        logger.error("Failed DB connection in add_interest")
        raise ValueError("Database connection error")

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO user_interests (user_id, interest, created_at)
            VALUES (%s, %s, NOW())
        """
        cursor.execute(query, (user_id, interest))
        connection.commit()
        logger.info(f"Interest '{interest}' added for user_id {user_id}")
    except Exception as e:
        connection.rollback()
        logger.error(f"Error adding interest: {e}\n{traceback.format_exc()}")
        raise ValueError("Failed to add interest")
    finally:
        cursor.close()
        connection.close()

def delete_interest(user_id: int, interest: str):
    connection = get_connection()
    if not connection:
        logger.error("Failed DB connection in delete_interest")
        raise ValueError("Database connection error")

    try:
        cursor = connection.cursor()
        query = "DELETE FROM user_interests WHERE user_id = %s AND interest = %s"
        cursor.execute(query, (user_id, interest))
        connection.commit()
        logger.info(f"Interest '{interest}' deleted for user_id {user_id}")
    except Exception as e:
        connection.rollback()
        logger.error(f"Error deleting interest: {e}\n{traceback.format_exc()}")
        raise ValueError("Failed to delete interest")
    finally:
        cursor.close()
        connection.close()

def get_interests_by_user(user_id: int):
    connection = get_connection()
    if not connection:
        logger.error("Failed DB connection in get_interests_by_user")
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT interest FROM user_interests WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()
        return [row['interest'] for row in result]
    except Exception as e:
        logger.error(f"Error fetching interests: {e}\n{traceback.format_exc()}")
        return []
    finally:
        cursor.close()
        connection.close()
