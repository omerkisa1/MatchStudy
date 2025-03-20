<template>
  <div class="home-container">
    <!-- ÜST NAV / HEADER -->
    <header class="navbar">
      <nav class="navbar-inner">
        <!-- Sol tarafa logo veya site ismi -->
        <div class="navbar-brand">
          <router-link to="/">MatchStudy</router-link>
        </div>
  
        <!-- Sağ tarafa profil vs. linkler -->
        <ul class="navbar-menu">
          <li>
            <router-link to="/dashboard/profile">Profil</router-link>
          </li>
          <li>
            <!-- Çıkış Yap: Token'ı siler, login sayfasına yönlendirir -->
            <button @click="handleLogout">Çıkış Yap</button>
          </li>
        </ul>
      </nav>
    </header>
  
    <!-- ANA İÇERİK (HERO / INTRO) -->
    <main class="hero-section">
      <section>
        <h1>MatchStudy'e Hoş Geldin!</h1>
        <p>Birlikte öğrenmek için eşleşmelerini yönet, çalışma isteklerini oluştur ve profilini tamamla.</p>
        
        <div class="action-buttons">
          <router-link to="/dashboard/study-requests" class="btn">Çalışma İsteği Oluştur</router-link>
          <router-link to="/dashboard/matches" class="btn">Eşleşmeleri Gör</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  methods: {
    handleLogout() {
      // Örnek bir çıkış mekanizması
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
/* Aynı renk değişkenlerini burada da kullanıyoruz */
:root {
  --color-dark: #2D336B;   /* Koyu */
  --color-mid: #7886C7;    /* Orta */
  --color-light: #A9B5DF;  /* Açık */
  --color-bg: #FFF2F2;     /* Çok Açık */
}

/* Home Container Tüm Sayfa Alanı */
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* NAVBAR */
.navbar {
  background-color: var(--color-dark);
  padding: 0.5rem 1rem;
}

.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Marka kısmı */
.navbar-brand a {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  text-decoration: none;
}

/* Menü */
.navbar-menu {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
}

/* Link ve butonlar */
.navbar-menu li a,
.navbar-menu li button {
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 1rem;
  color: #fff;
  font-weight: 500;
}

.navbar-menu li button:hover,
.navbar-menu li a:hover {
  opacity: 0.8;
}

/* HERO SECTION */
.hero-section {
  flex: 1; /* geri kalan yüksekliği kaplasın */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.hero-section section {
  max-width: 600px;
  margin: 2rem auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  /* Orta tonlu bir gölge ekleyelim */
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.hero-section h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-dark);
}

.hero-section p {
  margin-bottom: 2rem;
  color: #555;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Buton Stil */
.action-buttons .btn {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  background-color: var(--color-mid);
  border-radius: 4px;
  color: #fff;
  font-weight: 600;
  transition: background 0.3s;
}

.action-buttons .btn:hover {
  background-color: var(--color-dark);
}
</style>
