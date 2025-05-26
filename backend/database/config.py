import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "mysql.railway.internal"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "eTnChVZTyCrpkLViPpyyDoAjadihLclu"),
    "database": os.getenv("DB_NAME", "railway"),
    "charset": "utf8mb4",
    "use_unicode": True,
    "collation": "utf8mb4_turkish_ci"
}