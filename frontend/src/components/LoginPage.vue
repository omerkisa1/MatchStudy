<template>
  <div class="login-page">
    <!-- Animasyonlu arka plan parçacıkları -->
    <div class="particles-container">
      <div v-for="n in 20" :key="n" class="particle" :class="`p${n}`"></div>
    </div>

    <!-- Ana login kartı -->
    <div class="login-card" :class="{ 'success': loginSuccess }">
      <div class="card-content">
        <!-- Logo animasyonu -->
        <div class="logo-container">
          <div class="logo-circle">
            <div class="logo-inner">
              <span class="logo-letter">A</span>
            </div>
            <div class="logo-ring"></div>
          </div>
        </div>

        <!-- Başlık ve altyazı -->
        <div class="text-content" :class="{ 'slide-up': isLoading }">
          <h1 class="title">Hoş Geldiniz</h1>
          <p class="subtitle">Hesabınıza erişim için giriş yapın</p>
        </div>

        <!-- Form alanı -->
        <form @submit.prevent="handleLogin" class="login-form" :class="{ 'fade-out': isLoading }">
          <div class="error-container" v-if="errorMessage">
            <div class="error-icon">!</div>
            <span class="error-text">{{ errorMessage }}</span>
          </div>

          <!-- Email input grubu -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input 
                type="email" 
                v-model="email" 
                placeholder="E-posta adresinizi girin"
                class="form-input" />
            </div>
          </div>

          <!-- Şifre input grubu -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Şifrenizi girin"
                class="form-input" />
              <button 
                type="button"
                class="password-toggle"
                @click="togglePassword">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Hatırla beni ve şifremi unuttum -->
          <div class="form-options">
            <div class="remember-me">
              <label class="checkbox-container">
                <input type="checkbox" v-model="rememberMe">
                <span class="checkmark"></span>
                Beni hatırla
              </label>
            </div>
            <a href="#" class="forgot-password">Şifremi unuttum</a>
          </div>

          <!-- Giriş butonları -->
          <div class="action-buttons">
            <button type="submit" class="primary-button" :disabled="!isFormValid || isLoading">
              <span class="button-text" v-if="!isLoading">Giriş Yap</span>
              <div class="loader" v-else>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </form>

        <!-- Başarılı giriş animasyonu -->
        <div class="success-animation" v-if="loginSuccess">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
          <p class="success-text">Giriş başarılı!</p>
        </div>

        <!-- Alternatif giriş seçenekleri -->
        <div class="divider" :class="{ 'fade-out': isLoading }">
          <span>veya</span>
        </div>
        
        <div class="social-login" :class="{ 'fade-out': isLoading }">
          <button class="social-button google" @click.prevent="socialLogin('google')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google ile giriş</span>
          </button>
          
          <button class="social-button facebook" @click.prevent="socialLogin('facebook')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>
            </svg>
            <span>Facebook ile giriş</span>
          </button>
          
          <button class="social-button apple" @click.prevent="socialLogin('apple')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M16.289 13.362c-.037-3.153 2.582-4.702 2.694-4.774-1.469-2.152-3.756-2.446-4.566-2.476-1.932-.198-3.8 1.144-4.782 1.144-.996 0-2.519-1.116-4.146-1.088-2.118.032-4.091 1.241-5.173 3.133-2.231 3.872-.57 9.584 1.584 12.721 1.065 1.536 2.318 3.258 3.966 3.196 1.599-.064 2.199-1.03 4.13-1.03 1.916 0 2.466 1.03 4.146.996 1.712-.026 2.798-1.548 3.836-3.094 1.227-1.775 1.723-3.515 1.744-3.605-.038-.014-3.333-1.274-3.361-5.083zm-3.155-9.359c.873-1.067 1.469-2.539 1.306-4.003-1.264.056-2.847.851-3.763 1.902-.81.943-1.53 2.463-1.343 3.907 1.421.106 2.878-.717 3.801-1.806z" fill="currentColor" />
            </svg>
            <span>Apple ile giriş</span>
          </button>
        </div>
        
        <!-- Hesap oluşturma seçeneği -->
        <div class="signup-option" :class="{ 'fade-out': isLoading }">
          <p>Hesabınız yok mu? <a href="#" @click.prevent="goToSignup">Hemen kaydolun</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import { initSocket } from "@/socket";

export default {
  name: "EnhancedLoginPage",
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    const email = ref("");
    const password = ref("");
    const rememberMe = ref(false);
    const errorMessage = ref("");
    const activeField = ref(null);
    const showPassword = ref(false);
    const isLoading = ref(false);
    const loginSuccess = ref(false);

    const particleStyles = reactive({});

    onMounted(() => {
      for (let i = 1; i <= 20; i++) {
        particleStyles[`p${i}`] = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`,
          size: `${5 + Math.random() * 15}px`
        };
      }

      const savedEmail = localStorage.getItem("email");
      const savedPassword = localStorage.getItem("password");

      if (savedEmail && savedPassword) {
        email.value = savedEmail;
        password.value = savedPassword;
        rememberMe.value = true;
      }
    });

    const setActiveField = (field) => {
      activeField.value = field;
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isFormValid = computed(() => {
      return email.value.length > 0 && password.value.length > 0;
    });

    const handleLogin = async () => {
      if (!validateEmail(email.value)) {
        errorMessage.value = "Lütfen geçerli bir e-posta adresi girin";
        return;
      }

      if (password.value.length < 6) {
        errorMessage.value = "Şifre en az 6 karakter olmalıdır";
        return;
      }

      errorMessage.value = "";
      isLoading.value = true;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/users/get_id?email=${encodeURIComponent(email.value)}&password=${encodeURIComponent(password.value)}`
        );
        const data = await response.json();

        if (response.ok && data.user_id) {
          // Kullanıcı bilgilerini store'a yaz
          userStore.setUser({
            id: data.user_id,
            email: email.value,
            name: email.value.split("@")[0],
            surname: "",
            age: null,
            gender: "",
            education_level: "",
            interests: []
          });

          // 🔌 Socket bağlantısını login'den sonra başlat
          initSocket(data.user_id);

          localStorage.setItem("userId", data.user_id);
          localStorage.setItem("userEmail", email.value);
          localStorage.setItem("userName", email.value.split("@")[0]);

          if (rememberMe.value) {
            localStorage.setItem("email", email.value);
            localStorage.setItem("password", password.value);
          } else {
            localStorage.removeItem("email");
            localStorage.removeItem("password");
          }

          loginSuccess.value = true;

          setTimeout(() => {
            router.push("/home");
          }, 1500);
        } else {
          throw new Error(data.message || "Kullanıcı bulunamadı");
        }
      } catch (error) {
        console.error("Login error:", error);
        errorMessage.value = "Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.";
      } finally {
        isLoading.value = false;
      }
    };

    const socialLogin = (provider) => {
      isLoading.value = true;
      setTimeout(() => {
        //console.log(`${provider} ile giriş yapılıyor...`);
        loginSuccess.value = true;
        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);
      }, 1500);
    };

    const goToSignup = () => {
      window.location.href = "/signup";
    };

    return {
      email,
      password,
      errorMessage,
      activeField,
      showPassword,
      rememberMe,
      isLoading,
      loginSuccess,
      particleStyles,
      setActiveField,
      togglePassword,
      isFormValid,
      handleLogin,
      socialLogin,
      goToSignup
    };
  }
};
</script>



<style>
/* Global stil tanımlamaları */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Outfit', sans-serif;
}

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
  --shadow-inner: inset 0 2px 6px rgba(0, 0, 0, 0.15);
  
  /* Diğer değişkenler */
  --border-radius-sm: 8px;
  --border-radius-md: 16px;
  --border-radius-lg: 24px;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

/* Ana login sayfası */
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  position: relative;
  overflow: hidden;
}

/* Animasyonlu arka plan parçacıkları */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(126, 87, 194, 0.2);
  box-shadow: 0 0 15px rgba(126, 87, 194, 0.6);
  animation: float 10s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-30px) translateX(15px) scale(1.1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-15px) translateX(30px) scale(0.8);
    opacity: 0.4;
  }
  75% {
    transform: translateY(30px) translateX(-15px) scale(1.2);
    opacity: 0.7;
  }
}

/* Her parçacık için farklı boyut ve animasyon süresi */
.p1 { left: 10%; top: 20%; animation-delay: 0s; animation-duration: 12s; width: 12px; height: 12px; }
.p2 { left: 20%; top: 80%; animation-delay: 0.5s; animation-duration: 10s; width: 8px; height: 8px; }
.p3 { left: 30%; top: 40%; animation-delay: 1s; animation-duration: 14s; width: 10px; height: 10px; }
.p4 { left: 40%; top: 60%; animation-delay: 1.5s; animation-duration: 11s; width: 14px; height: 14px; }
.p5 { left: 50%; top: 30%; animation-delay: 2s; animation-duration: 13s; width: 9px; height: 9px; }
.p6 { left: 60%; top: 70%; animation-delay: 2.5s; animation-duration: 15s; width: 11px; height: 11px; }
.p7 { left: 70%; top: 25%; animation-delay: 3s; animation-duration: 9s; width: 15px; height: 15px; }
.p8 { left: 80%; top: 55%; animation-delay: 3.5s; animation-duration: 12s; width: 10px; height: 10px; }
.p9 { left: 90%; top: 35%; animation-delay: 4s; animation-duration: 14s; width: 12px; height: 12px; }
.p10 { left: 15%; top: 45%; animation-delay: 4.5s; animation-duration: 11s; width: 8px; height: 8px; }
.p11 { left: 25%; top: 65%; animation-delay: 5s; animation-duration: 13s; width: 10px; height: 10px; }
.p12 { left: 35%; top: 15%; animation-delay: 5.5s; animation-duration: 10s; width: 13px; height: 13px; }
.p13 { left: 45%; top: 75%; animation-delay: 6s; animation-duration: 12s; width: 9px; height: 9px; }
.p14 { left: 55%; top: 25%; animation-delay: 6.5s; animation-duration: 14s; width: 11px; height: 11px; }
.p15 { left: 65%; top: 85%; animation-delay: 7s; animation-duration: 11s; width: 14px; height: 14px; }
.p16 { left: 75%; top: 45%; animation-delay: 7.5s; animation-duration: 13s; width: 8px; height: 8px; }
.p17 { left: 85%; top: 15%; animation-delay: 8s; animation-duration: 12s; width: 10px; height: 10px; }
.p18 { left: 95%; top: 60%; animation-delay: 8.5s; animation-duration: 10s; width: 12px; height: 12px; }
.p19 { left: 5%; top: 50%; animation-delay: 9s; animation-duration: 14s; width: 11px; height: 11px; }
.p20 { left: 85%; top: 90%; animation-delay: 9.5s; animation-duration: 12s; width: 9px; height: 9px; }

/* Login kartı */
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  min-height: 580px;
  border-radius: var(--border-radius-lg);
  background: var(--surface-color);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-lg),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 30px rgba(126, 87, 194, 0.25);
  overflow: hidden;
  transform: translateZ(0);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.login-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: var(--shadow-lg),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    0 0 40px rgba(126, 87, 194, 0.35);
}

.login-card:before {
  content: '';
  position: absolute;
  top: -150px;
  left: -150px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(126, 87, 194, 0.3) 0%, rgba(126, 87, 194, 0) 70%);
  z-index: -1;
  animation: pulse 15s infinite alternate;
}

.login-card:after {
  content: '';
  position: absolute;
  bottom: -150px;
  right: -150px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 213, 79, 0.2) 0%, rgba(255, 213, 79, 0) 70%);
  z-index: -1;
  animation: pulse 15s infinite alternate-reverse;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

.card-content {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

/* Logo */
.logo-container {
  margin-bottom: 20px;
}

.logo-circle {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-inner {
  width: 60px;
  height: 60px;
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
  font-size: 36px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.logo-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
  animation: spin 10s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

/* Metin içeriği */
.text-content {
  text-align: center;
  margin-bottom: 20px;
  transition: transform var(--transition-normal);
}

.slide-up {
  transform: translateY(-100px);
}

.title {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 400;
}

/* Form */
.login-form {
  width: 100%;
  transition: opacity var(--transition-normal);
}

.fade-out {
  opacity: 0;
  pointer-events: none;
}

.error-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 12px;
  border-radius: var(--border-radius-sm);
  background: rgba(244, 67, 54, 0.15);
  border-left: 3px solid #f44336;
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% {
    transform: translateX(-1px);
  }
  20%, 80% {
    transform: translateX(2px);
  }
  30%, 50%, 70% {
    transform: translateX(-4px);
  }
  40%, 60% {
    transform: translateX(4px);
  }
}

.error-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 10px;
}

.error-text {
  color: #f44336;
  font-size: 14px;
  font-weight: 500;
}

/* Input grupları */
.form-group {
  margin-bottom: 16px;
  position: relative;
}

.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon svg {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.input-icon .form-input {
  padding-left: 3rem;
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: var(--surface-color-light);
  color: var(--text-primary);
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.password-toggle svg {
  position: static;
  width: 20px;
  height: 20px;
}

/* Form seçenekleri */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 11px;
}

.checkbox-container input {
  display: none;
}

.checkmark {
  width: 8px;
  height: 8x;
  margin-right: 4px;
  border: 1px solid var(--text-disabled);
  border-radius: 2px;
  position: relative;
  transition: all var(--transition-fast);
}

.checkbox-container input:checked ~ .checkmark {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-container input:checked ~ .checkmark:after {
  content: '';
  position: absolute;
  left: 2px;
  top: 1px;
  width: 2px;
  height: 6px;
  border: solid white;
  border-width: 0 1px 1px 0;
  transform: rotate(45deg);
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 11px;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.forgot-password:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

/* Butonlar */
.action-buttons {
  margin-bottom: 16px;
}

.primary-button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(126, 87, 194, 0.4);
}

.primary-button:active {
  transform: translateY(0);
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Yükleme animasyonu */
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.loader span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: bounce 0.5s infinite alternate;
}

.loader span:nth-child(2) {
  animation-delay: 0.1s;
}

.loader span:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes bounce {
  to {
    transform: translateY(-8px);
  }
}

/* Başarılı giriş animasyonu */
.success-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.checkmark {
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: var(--primary-color);
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke: var(--primary-color);
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

.success-text {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  opacity: 0;
  animation: fadeIn 0.5s ease-out 1.2s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Ayırıcı */
.divider {
  width: 100%;
  text-align: center;
  margin: 16px 0;
  position: relative;
  transition: opacity var(--transition-normal);
}

.divider:before,
.divider:after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 30px);
  height: 1px;
  background: var(--text-disabled);
}

.divider:before {
  left: 0;
}

.divider:after {
  right: 0;
}

.divider span {
  color: var(--text-secondary);
  background: var(--surface-color);
  padding: 0 15px;
  font-size: 14px;
}

/* Sosyal medya butonları */
.social-login {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  transition: opacity var(--transition-normal);
}

.social-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: var(--surface-color-light);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.social-button svg {
  width: 20px;
  height: 20px;
  margin-right: 6px;
}

.social-button span {
  flex: 1;
  text-align: center;
}

.social-button.google {
  background: white;
  color: #333;
}

.social-button.facebook {
  background: #1877F2;
  color: white;
}

.social-button.apple {
  background: black;
  color: white;
}

.social-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Kayıt seçeneği */
.signup-option {
  text-align: center;
  margin-top: 16px;
  transition: opacity var(--transition-normal);
}

.signup-option p {
  color: var(--text-secondary);
  font-size: 14px;
}

.signup-option a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.signup-option a:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

/* Responsive tasarım */
@media (max-width: 768px) {
  .login-card {
    margin: 20px;
    min-height: auto;
  }

  .card-content {
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .input-group input {
    font-size: 14px;
  }

  .social-button {
    padding: 8px;
  }
  
  .social-button svg {
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }
  
  .social-button span {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .social-login {
    flex-direction: column;
    gap: 8px;
  }
  
  .social-button {
    width: 100%;
  }
}

/* Karanlık mod desteği */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-gradient-start: #0A051A;
    --bg-gradient-end: #1A0D33;
    --surface-color: rgba(20, 15, 35, 0.85);
    --surface-color-light: rgba(30, 25, 45, 0.9);
  }
}
</style>
