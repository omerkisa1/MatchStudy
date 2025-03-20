<template>
  <div class="home-container">
    <!-- Sol Navigasyon Bar -->
    <nav class="sidebar">
      <div class="sidebar-top">
        <!-- Logo -->
        <div class="logo-container">
          <div class="logo-circle">
            <div class="logo-inner">
              <span class="logo-letter">A</span>
            </div>
            <div class="logo-ring"></div>
          </div>
        </div>

        <!-- Ana Menü -->
        <div class="nav-menu">
          <a @click="changeContent('create-request')" :class="['nav-item', { active: currentContent === 'create-request' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span>Ders İsteği Oluştur</span>
          </a>

          <a @click="changeContent('discover')" :class="['nav-item', { active: currentContent === 'discover' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <span>Keşfet</span>
          </a>

          <a @click="changeContent('messages')" :class="['nav-item', { active: currentContent === 'messages' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span>Mesajlar</span>
          </a>

          <a @click="changeContent('notifications')" :class="['nav-item', { active: currentContent === 'notifications' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <span>Bildirimler</span>
          </a>

          <a @click="changeContent('history')" :class="['nav-item', { active: currentContent === 'history' }]">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span>Geçmiş</span>
          </a>
        </div>
      </div>

      <!-- Profil Bölümü (En Alt) -->
      <div class="profile-section">
        <a @click="changeContent('profile')" :class="['nav-item', { active: currentContent === 'profile' }]">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span>Profilim</span>
        </a>
      </div>
    </nav>

    <!-- Ana İçerik Alanı -->
    <main class="main-content">
      <transition name="fade" mode="out-in">
        <div v-if="currentContent === 'home'" class="content-wrapper">
          <h1>Hoş Geldiniz</h1>
          <p>Birlikte öğrenmek için eşleşmelerini yönet, çalışma isteklerini oluştur ve profilini tamamla.</p>
        </div>

        <div v-else-if="currentContent === 'create-request'" class="content-wrapper">
          <h1>Ders İsteği Oluştur</h1>
          <div class="create-request-form">
            <div class="form-group">
              <label>Ders Konusu</label>
              <input type="text" placeholder="Örn: Calculus, Physics, Programming" />
            </div>
            <div class="form-group">
              <label>Açıklama</label>
              <textarea placeholder="Çalışmak istediğiniz konuyu detaylandırın..."></textarea>
            </div>
            <div class="form-group">
              <label>Tarih ve Saat</label>
              <input type="datetime-local" />
            </div>
            <button class="submit-btn">İstek Oluştur</button>
          </div>
        </div>

        <div v-else-if="currentContent === 'discover'" class="content-wrapper">
          <h1>Keşfet</h1>
          <div class="discover-grid">
            <div class="study-card" v-for="i in 6" :key="i">
              <div class="card-header">
                <h3>Matematik Çalışma Grubu</h3>
                <span class="tag">Matematik</span>
              </div>
              <p>Calculus II konularında birlikte çalışmak için grup arkadaşları arıyorum.</p>
              <div class="card-footer">
                <span class="date">24 Mart 2024</span>
                <button class="join-btn">Katıl</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'messages'" class="content-wrapper">
          <h1>Mesajlar</h1>
          <div class="messages-container">
            <div class="message-list">
              <div class="message-item" v-for="i in 5" :key="i">
                <div class="message-avatar"></div>
                <div class="message-content">
                  <h4>Kullanıcı {{i}}</h4>
                  <p>Son mesaj içeriği burada görünecek...</p>
                </div>
                <span class="message-time">14:30</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'notifications'" class="content-wrapper">
          <h1>Bildirimler</h1>
          <div class="notifications-list">
            <div class="notification-item" v-for="i in 4" :key="i">
              <div class="notification-icon"></div>
              <div class="notification-content">
                <p>Yeni bir eşleşme isteği aldınız.</p>
                <span class="notification-time">2 saat önce</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'history'" class="content-wrapper">
          <h1>Geçmiş</h1>
          <div class="history-timeline">
            <div class="timeline-item" v-for="i in 3" :key="i">
              <div class="timeline-date">
                <span>Mart {{i + 20}}</span>
              </div>
              <div class="timeline-content">
                <h3>Fizik Çalışma Oturumu</h3>
                <p>2 saat süren verimli bir çalışma gerçekleşti.</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentContent === 'profile'" class="content-wrapper">
          <h1>Profilim</h1>
          <div class="profile-container">
            <div class="profile-header">
              <div class="profile-avatar"></div>
              <div class="profile-info">
                <h2>Kullanıcı Adı</h2>
                <p>Üniversite / Bölüm</p>
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">12</span>
                <span class="stat-label">Tamamlanan Çalışma</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">4.8</span>
                <span class="stat-label">Ortalama Puan</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">8</span>
                <span class="stat-label">Aktif Grup</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: "HomePage",
  setup() {
    const currentContent = ref('home');

    const changeContent = (content) => {
      currentContent.value = content;
    };

    return {
      currentContent,
      changeContent
    };
  }
};
</script>

<style>
/* Global stil tanımlamaları */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  /* Ana renkler */
  --primary-color: #7E57C2;
  --primary-light: #B39DDB;
  --primary-dark: #4527A0;
  --accent-color: #FFD54F;
  
  /* Arka plan ve yüzey renkleri */
  --bg-gradient-start: #1A1033;
  --bg-gradient-end: #2D1A54;
  --surface-color: rgba(30, 22, 54, 0.85);
  --surface-color-light: rgba(45, 35, 75, 0.9);
  
  /* Metin renkleri */
  --text-primary: rgba(255, 255, 255, 0.9);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-disabled: rgba(255, 255, 255, 0.5);
  
  /* Gölgeler */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.home-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
}

/* Sidebar Stili */
.sidebar {
  width: 280px;
  background: var(--surface-color);
  backdrop-filter: blur(20px);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-lg);
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Logo Stili */
.logo-container {
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.logo-circle {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-inner {
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  box-shadow: var(--shadow-md);
  z-index: 2;
}

.logo-letter {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
}

.logo-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
  animation: spin 10s linear infinite;
}

@keyframes spin {
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}

/* Navigasyon Menü */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: var(--surface-color-light);
  color: var(--text-primary);
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 1rem;
}

.nav-item.router-link-active {
  background: var(--primary-color);
  color: var(--text-primary);
}

/* Profil Bölümü */
.profile-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

/* Ana İçerik Alanı */
.main-content {
  position: relative;
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  color: var(--text-primary);
}

.content-wrapper h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.content-wrapper p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* Responsive Tasarım */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    padding: 1rem 0.5rem;
  }

  .nav-item span {
    display: none;
  }

  .nav-icon {
    margin-right: 0;
  }

  .logo-circle {
    width: 40px;
    height: 40px;
  }

  .logo-inner {
    width: 30px;
    height: 30px;
  }

  .logo-letter {
    font-size: 16px;
  }

  .logo-ring {
    width: 40px;
    height: 40px;
  }
}

/* Router geçiş animasyonları */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Active nav item stili */
.nav-item.active {
  background: var(--primary-color);
  color: var(--text-primary);
}

/* Nav item hover efekti */
.nav-item {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.nav-item::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-light);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.nav-item:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* Yeni içerik stilleri */
.create-request-form {
  background: var(--surface-color);
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: var(--surface-color-light);
  color: var(--text-primary);
}

.submit-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: var(--primary-dark);
}

/* Keşfet grid */
.discover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.study-card {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.tag {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.join-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

/* Mesajlar */
.message-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-right: 1rem;
}

/* Bildirimler */
.notifications-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Profil */
.profile-container {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-right: 2rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.stat-item {
  background: var(--surface-color-light);
  padding: 1.5rem;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Timeline */
.history-timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 0;
  width: 2px;
  height: 100%;
  background: var(--primary-color);
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: -2.35rem;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
}

.timeline-date {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.timeline-content {
  background: var(--surface-color);
  padding: 1rem;
  border-radius: 8px;
}
</style>
