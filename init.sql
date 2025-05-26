
USE railway;

-- 2. USERS TABLOSU
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    age INT,
    education_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. PROFILES TABLOSU
CREATE TABLE profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    institution VARCHAR(255),
    bio VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. STUDY REQUESTS TABLOSU
CREATE TABLE study_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    duration VARCHAR(20) DEFAULT '1-2 saat',
    study_date DATE NOT NULL,
    topic VARCHAR(255),
    note TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. MATCHES TABLOSU
CREATE TABLE matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    requester_id INT NOT NULL,
    responder_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES study_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (responder_id) REFERENCES users(id)
);

-- 6. USER INTERESTS TABLOSU
CREATE TABLE user_interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    interest VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. CHATS TABLOSU
CREATE TABLE chats (
    chat_id VARCHAR(255) PRIMARY KEY,
    user_1_id INT NOT NULL,
    user_2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. MESSAGES TABLOSU
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. MESSAGE STATUS TABLOSU
CREATE TABLE message_status (
    message_id INT PRIMARY KEY,
    delivered_at DATETIME DEFAULT NULL,
    read_at DATETIME DEFAULT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- 10. FRIEND REQUESTS TABLOSU
CREATE TABLE friend_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (sender_id, receiver_id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Test verileri

-- USERS
INSERT INTO users (email, password, name, surname, age, education_level) VALUES
  ('emir@example.com', '123456', 'Emir', 'Candan', 22, 'lisans'),
  ('bora@example.com', '123456', 'Bora', 'Hacıköylü', 24, 'yükseklisans'),
  ('furkan@example.com', '123456', 'Furkan', 'Kalkan', 21, 'lisans');

-- PROFILES
INSERT INTO profiles (user_id, institution, bio) VALUES
  (1, 'Boğaziçi Üniversitesi', 'Matematik tutkunu'),
  (2, 'ODTÜ', 'Fizik sever'),
  (3, 'İTÜ', 'Kod yazmayı seviyorum');

-- STUDY REQUESTS
INSERT INTO study_requests (user_id, category, duration, study_date, topic, note) VALUES
  (1, 'Matematik', '1-2 saat', '2025-05-10', 'Türev Uygulamaları', 'Lütfen grafik çizmeyi de tekrar edelim.'),
  (2, 'Fizik', '3-4 saat', '2025-05-11', 'Kuvvet ve Hareket', 'Soru çözümü ağırlıklı çalışalım.'),
  (3, 'Yazılım', '5-6 saat', '2025-05-12', 'Python ile OOP', 'Mini proje geliştirmek istiyorum.');

-- MATCHES
INSERT INTO matches (request_id, requester_id, responder_id, status) VALUES
  (1, 1, 2, 'accepted'),
  (2, 2, 3, 'pending'),
  (3, 3, 1, 'rejected');

-- USER INTERESTS
INSERT INTO user_interests (user_id, interest) VALUES
  (1, 'Yapay Zeka'),
  (1, 'Matematik'),
  (2, 'Fizik'),
  (2, 'Astronomi'),
  (3, 'Programlama'),
  (3, 'Veri Bilimi');

-- CHATS
INSERT INTO chats (chat_id, user_1_id, user_2_id) VALUES
  ('chat_1_2', 1, 2),
  ('chat_2_3', 2, 3);

-- MESSAGES
INSERT INTO messages (chat_id, sender_id, content) VALUES
  ('chat_1_2', 1, 'Merhaba Bora, birlikte türev çalışalım mı?'),
  ('chat_1_2', 2, 'Tabii ki Emir! Grafik konusuna da bakalım.'),
  ('chat_2_3', 2, 'Furkan, yarınki fizikle ilgili hazır mısın?');

-- MESSAGE STATUS
INSERT INTO message_status (message_id, delivered_at, read_at) VALUES
  (1, NOW(), NOW()),
  (2, NOW(), NULL),
  (3, NOW(), NOW());

-- FRIEND REQUESTS
INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES
  (1, 3, 'pending'),
  (2, 1, 'accepted'),
  (3, 2, 'rejected');

-- ADMIN USERS
INSERT INTO admin_users (
    username, password_hash, full_name, email, role, is_active, last_login
) VALUES
(
    'admin1',
    'admin123',
    'Ömer Seher',
    'omerseher@example.com',
    'admin',
    TRUE,
    '2025-05-14 10:00:00'
);