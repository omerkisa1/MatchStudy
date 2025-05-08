<template>
  <div class="register-page">
    <!-- Animasyonlu arka plan parçacıkları -->
    <div class="particles-container">
      <div v-for="n in 20" :key="n" class="particle" :class="`p${n}`"></div>
    </div>

    <!-- Ana kayıt kartı -->
    <div class="register-card" :class="{ 'success': registerSuccess }">
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
          <h1 class="title">Kayıt Ol</h1>
          <p class="subtitle">Yeni bir hesap oluşturun</p>
        </div>

        <!-- Form alanı -->
        <form @submit.prevent="handleRegister" class="register-form" :class="{ 'fade-out': isLoading }">
          <div class="error-container" v-if="errorMessage">
            <div class="error-icon">!</div>
            <span class="error-text">{{ errorMessage }}</span>
          </div>

          <!-- Ad input -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input 
                type="text" 
                v-model="name" 
                placeholder="Adınız"
                class="form-input" />
            </div>
          </div>

          <!-- Soyad input -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input 
                type="text" 
                v-model="surname" 
                placeholder="Soyadınız"
                class="form-input" />
            </div>
          </div>

          <!-- Email input -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input 
                type="email" 
                v-model="email" 
                placeholder="E-posta adresiniz"
                class="form-input" />
            </div>
          </div>

          <!-- Şifre input -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Şifreniz"
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

          <!-- Yaş input -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <input 
                type="number" 
                v-model="age" 
                placeholder="Yaşınız"
                class="form-input" />
            </div>
          </div>

          <!-- Eğitim seviyesi select -->
          <div class="form-group">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <select v-model="educationLevel" class="form-input">
                <option value="">Eğitim Seviyeniz</option>
                <option value="İlkokul">İlkokul</option>
                <option value="Ortaokul">Ortaokul</option>
                <option value="Lise">Lise</option>
                <option value="Lisans">Lisans</option>
                <option value="Yüksek Lisans">Yüksek Lisans</option>
                <option value="Doktora">Doktora</option>
              </select>
            </div>
          </div>

          <!-- Kayıt butonu -->
          <div class="action-buttons">
            <button type="submit" class="primary-button" :disabled="!isFormValid || isLoading">
              <span class="button-text" v-if="!isLoading">Kayıt Ol</span>
              <div class="loader" v-else>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </form>

        <!-- Başarılı kayıt animasyonu -->
        <div class="success-animation" v-if="registerSuccess">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
          <p class="success-text">Kayıt başarılı!</p>
        </div>

        <!-- Giriş sayfasına dönüş linki -->
        <div class="login-option" :class="{ 'fade-out': isLoading }">
          <p>Zaten hesabınız var mı? <a href="#" @click.prevent="goToLogin">Giriş Yapın</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter();
    const name = ref('');
    const surname = ref('');
    const email = ref('');
    const password = ref('');
    const age = ref('');
    const educationLevel = ref('');
    const showPassword = ref(false);
    const isLoading = ref(false);
    const registerSuccess = ref(false);
    const errorMessage = ref('');

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isFormValid = computed(() => {
      return name.value && 
             surname.value && 
             email.value && 
             password.value && 
             age.value && 
             educationLevel.value;
    });

    const handleRegister = async () => {
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
        const response = await fetch('http://127.0.0.1:8000/users/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
            name: name.value,
            surname: surname.value,
            age: parseInt(age.value),
            education_level: educationLevel.value
          })
        });

        const data = await response.json();

        if (response.ok && data.message === true) {
          registerSuccess.value = true;
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else {
          throw new Error(data.detail || 'Kayıt işlemi başarısız oldu');
        }
      } catch (error) {
        console.error('Register error:', error);
        errorMessage.value = error.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
      } finally {
        isLoading.value = false;
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    return {
      name,
      surname,
      email,
      password,
      age,
      educationLevel,
      showPassword,
      isLoading,
      registerSuccess,
      errorMessage,
      togglePassword,
      isFormValid,
      handleRegister,
      goToLogin
    };
  }
};
</script>

<style>
/* Login sayfasındaki stilleri kullanıyoruz, sadece gerekli değişiklikleri yapıyoruz */
.register-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  position: relative;
  overflow: hidden;
}

.register-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  min-height: 680px; /* Form alanları için daha uzun */
  border-radius: var(--border-radius-lg);
  background: var(--surface-color);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transform: translateZ(0);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

/* Diğer stiller login sayfasıyla aynı */
</style> 