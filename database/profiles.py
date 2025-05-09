from database.config import DB_CONFIG
from mysql.connector import Error
import mysql.connector

def add_profile(user_id, name, surname, age, education_level, institution):
    """Add a new profile to the database"""
    connection = mysql.connector.connect(**DB_CONFIG)
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
        print(f"Profile {name} {surname} added successfully.")
    except Exception as e:
        connection.rollback()
        print(f"Error adding profile: {e}")
        raise ValueError(f"Failed to add profile: {e}")
    finally:
        cursor.close()
        connection.close()

def get_profile_by_user_id(user_id):
    """Get a profile by user_id"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM profiles WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        profile = cursor.fetchone()
        return profile
    except Exception as e:
        print(f"Error retrieving profile: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

def get_bio_by_user_id(user_id):
    """Get user's bio by user_id"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT bio FROM profiles WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        if result:
            return result['bio']  # sadece bio bilgisini döndür
        else:
            return None
    except Exception as e:
        print(f"Error retrieving bio: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

print(get_bio_by_user_id(1))

    
def update_profile(user_id, name, surname, age, education_level, institution):
    """Update an existing profile"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        # First check if profile exists
        profile = get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError(f"Profile with user_id {user_id} not found")
        
        # Prepare the update fields
        update_fields = {}
        if name is not None:
            update_fields["name"] = name
        if surname is not None:
            update_fields["surname"] = surname
        if age is not None:
            update_fields["age"] = age
        if education_level is not None:
            update_fields["education_level"] = education_level
        if institution is not None:
            update_fields["institution"] = institution
        
        if not update_fields:
            return  # Nothing to update
            
        # Build the SET clause dynamically
        set_clause = ", ".join([f"{field} = %s" for field in update_fields.keys()])
        query = f"UPDATE profiles SET {set_clause}, updated_at = NOW() WHERE user_id = %s"
        
        # Prepare the values for the query
        values = list(update_fields.values())
        values.append(user_id)  # Add the user_id for the WHERE clause
        
        cursor = connection.cursor()
        cursor.execute(query, values)
        connection.commit()
        print(f"Profile updated successfully.")
    except Exception as e:
        connection.rollback()
        print(f"Error updating profile: {e}")
        raise ValueError(f"Failed to update profile: {e}")
    finally:
        cursor.close()
        connection.close()

def delete_profile_by_user_id(user_id):
    """Delete a profile by user_id"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return

    try:
        cursor = connection.cursor()
        query = "DELETE FROM profiles WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        
        if cursor.rowcount == 0:
            raise ValueError(f"Profile with user_id {user_id} not found")
            
        connection.commit()
        print("Profile deleted successfully.")
    except Exception as e:
        connection.rollback()
        print(f"Error deleting profile: {e}")
        raise ValueError(f"Failed to delete profile: {e}")
    finally:
        cursor.close()
        connection.close()

def list_profiles():
    """List all profiles"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM profiles"
        cursor.execute(query)
        profiles = cursor.fetchall()
        return profiles
    except Exception as e:
        print(f"Error retrieving profiles: {e}")
        return []
    finally:
        cursor.close()
        connection.close()