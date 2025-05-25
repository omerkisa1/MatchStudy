import os

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", "Klmn5512300."),
    "database": os.environ.get("DB_NAME", "match_study"),
    "charset": "utf8mb4",
    "use_unicode": True,
    "collation": "utf8mb4_turkish_ci"
}