<template>
    <div class="home-container">
      <!-- ÜST NAV / HEADER -->
      <header>
        <nav class="navbar">
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
      <main>
        <section class="hero-section">
          <h1>MatchStudy'e Hoş Geldin!</h1>
          <p>Birlikte öğrenmek için eşleşmelerini yönet, çalışma isteklerini oluştur ve profilini tamamla.</p>
          
          <div class="action-buttons">
            <!-- Study request oluşturma sayfasına giden link -->
            <router-link to="/dashboard/study-requests" class="btn">Çalışma İsteği Oluştur</router-link>
            <!-- Eşleşmelerin listelendiği sayfaya link -->
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
  /* Örnek Basit Stil */
  
  .home-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  /* NAVBAR */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #eee; /* Örnek bir arkaplan rengi */
  }
  
  .navbar-brand {
    font-weight: bold;
    font-size: 1.2rem;
  }
  
  .navbar-menu {
    list-style: none;
    display: flex;
    gap: 1rem;
  }
  
  .navbar-menu li a,
  .navbar-menu li button {
    text-decoration: none;
    cursor: pointer;
    border: none;
    background: none;
    font-size: 1rem;
    color: #333;
  }
  
  /* HERO SECTION */
  .hero-section {
    text-align: center;
    margin-top: 5rem;
  }
  
  .hero-section h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
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
  
  .action-buttons .btn {
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    background-color: #ccc;
    border-radius: 4px;
    color: #333;
  }
  </style>
  