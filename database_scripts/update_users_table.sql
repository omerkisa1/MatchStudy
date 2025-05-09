-- users tablosuna bio ve institution sütunlarını ekleme
ALTER TABLE users 
ADD COLUMN bio TEXT DEFAULT NULL,
ADD COLUMN institution VARCHAR(255) DEFAULT NULL; 