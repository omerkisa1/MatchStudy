import csv
import mysql.connector
from mysql.connector import Error

def connect_db():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="310718",  # burası senin kendi mysql şifren
            database="match_study"
        )
        return connection
    except Error as e:
        print(f"❌ Veritabanına bağlanırken hata oluştu: {e}")
        return None

def add_user_to_database(email, password, created_at):
    connection = connect_db()
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO users (email, password, created_at) 
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (email, password, created_at))
        connection.commit()
        print(f"✅ Kullanıcı {email} başarıyla eklendi.")
    except Error as e:
        print(f"❌ Kullanıcı eklenirken hata oluştu: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def add_profile_to_database(user_id, name, surname, age, education_level, institution, created_at):
    connection = connect_db()
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO profiles (user_id, name, surname, age, education_level, institution, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, name, surname, age, education_level, institution, created_at))
        connection.commit()
        print(f"✅ Profil {name} {surname} başarıyla eklendi.")
    except Error as e:
        print(f"❌ Profil eklenirken hata oluştu: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def add_study_request_to_database(user_id, category, duration, study_date, topic, note, created_at):
    connection = connect_db()
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO study_requests (user_id, category, duration, study_date, topic, note, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, category, duration, study_date, topic, note, created_at))
        connection.commit()
        print(f"✅ Çalışma isteği ({topic}) başarıyla eklendi.")
    except Error as e:
        print(f"❌ Çalışma isteği eklenirken hata oluştu: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def add_match_to_database(request_id, requester_id, responder_id, status, matched_at):
    connection = connect_db()
    if not connection:
        return
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO matches (request_id, requester_id, responder_id, status, matched_at)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (request_id, requester_id, responder_id, status, matched_at))
        connection.commit()
        print(f"✅ Eşleşme {request_id} başarıyla eklendi.")
    except Error as e:
        print(f"❌ Eşleşme eklenirken hata oluştu: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def load_csv_to_database(csv_file_path, table_name):
    with open(csv_file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                if table_name == "users":
                    add_user_to_database(row["email"], row["password"], row["created_at"])
                elif table_name == "profiles":
                    add_profile_to_database(row["user_id"], row["name"], row["surname"], row["age"], row["education_level"], row["institution"], row["created_at"])
                elif table_name == "study_requests":
                    add_study_request_to_database(row["user_id"], row["category"], row["duration"], row["study_date"], row["topic"], row["note"], row["created_at"])
                elif table_name == "matches":
                    add_match_to_database(row["request_id"], row["requester_id"], row["responder_id"], row["status"], row["matched_at"])
            except Exception as e:
                print(f"❌ Hata: {e}")

csv_files = {
    "users": "C:\\repos\\MatchStudy\\csvFiles\\users_table.csv",
    "profiles": "C:\\repos\\MatchStudy\\csvFiles\\profiles_table.csv",
    "study_requests": "C:\\repos\\MatchStudy\\csvFiles\\study_requests_table.csv",
    "matches": "C:\\repos\\MatchStudy\\csvFiles\\matches_table.csv"
}

for table, path in csv_files.items():
    print(f"🔄 {table} tablosuna veri ekleniyor...")
    load_csv_to_database(path, table)

print("✅ Tüm veriler başarıyla eklendi!")
