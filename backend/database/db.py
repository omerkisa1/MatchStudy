import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print("✅ Veritabanına başarıyla bağlandı")
        return connection
    except Error as e:
        print(f"❌ Veritabanına bağlanırken hata oluştu: {e}")
        return None

get_db_connection() # Veritabanına bağlanıp bağlanamadığını kontrol etmek için