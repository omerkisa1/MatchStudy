<template>
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
        <a @click="navigateTo('home')" :class="['nav-item', { active: currentContent === 'home' }]">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span>Ana Sayfa</span>
        </a>

        <a @click="navigateTo('create-request')" :class="['nav-item', { active: currentContent === 'create-request' }]">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <span>Ders İsteği Oluştur</span>
        </a>

        <a @click="navigateTo('discover')" :class="['nav-item', { active: currentContent === 'discover' }]">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <span>Keşfet</span>
        </a>

        <a @click="navigateTo('messages')" :class="['nav-item', { active: currentContent === 'messages' }]">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span>Mesajlar</span>
        </a>

        <a @click="navigateTo('notifications')" :class="['nav-item', { active: currentContent === 'notifications' }]">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <span>Bildirimler</span>
        </a>

        <a @click="navigateTo('history')" :class="['nav-item', { active: currentContent === 'history' }]">
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
      <a @click="navigateTo('profile')" :class="['nav-item', { active: currentContent === 'profile' }]">
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
</template>

<script>
export default {
  name: "Sidebar",
  props: {
    currentContent: {
      type: String,
      required: true
    },
    navigateTo: {
      type: Function,
      required: true
    }
  }
}
</script>

<style>
/* Sidebar stili */
.sidebar {
  width: 280px;
  background: var(--surface-color);
  backdrop-filter: blur(20px);
  padding: 2rem;
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

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-circle {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.logo-letter {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(126, 87, 194, 0.08);
}

.nav-item.active {
  color: white;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  box-shadow: 0 4px 12px rgba(126, 87, 194, 0.25);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
}

.nav-icon {
  width: 22px;
  height: 22px;
  margin-right: 12px;
  opacity: 0.9;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2px;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon svg {
  transform: scale(1.1);
}

.nav-item span {
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* Profil bölümü için özel stiller */
.profile-section {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-section .nav-item {
  background: rgba(126, 87, 194, 0.08);
  border: 1px solid rgba(126, 87, 194, 0.15);
}

.profile-section .nav-item:hover {
  background: rgba(126, 87, 194, 0.12);
  border-color: rgba(126, 87, 194, 0.2);
  transform: translateY(-1px);
}

/* Responsive tasarım */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    padding: 1rem;
    flex-shrink: 0;
  }

  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .nav-item {
    white-space: nowrap;
  }
}
</style> 