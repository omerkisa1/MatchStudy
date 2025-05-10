<template>
    <div class="profile-container">
      <!-- Profil Başlığı ve Düzenleme -->
      <div class="profile-header">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <span>{{ userProfile.name?.[0]?.toUpperCase() || 'U' }}</span>
          </div>
        </div>
        <div class="profile-info">
          <div class="profile-name-section">
            <h2>
              {{ userProfile.name ?? 'null' }} {{ userProfile.surname ?? 'null' }}
            </h2>
            <button class="edit-profile-btn" @click="isEditingProfile = true" v-if="!isEditingProfile">
              Profili Düzenle
            </button>
          </div>
          <p>
            <strong>Yaş:</strong> {{ userProfile.age ?? 'null' }}
          </p>
          <p>
            <strong>Eğitim Seviyesi:</strong> {{ userProfile.education_level ?? 'null' }}
          </p>
          <p>
            <strong>E-posta:</strong> {{ userProfile.email ?? 'null' }}
          </p>
          <p>
            <strong>Kayıt Tarihi:</strong> {{ userProfile.created_at ?? 'null' }}
          </p>
          <p>
            <strong>Son Güncelleme:</strong> {{ userProfile.updated_at ?? 'null' }}
          </p>
        </div>
      </div>
  
      <!-- Profil Düzenleme Formu -->
      <div v-if="isEditingProfile" class="profile-edit-form">
        <h3>Profil Bilgilerini Düzenle</h3>
        <div class="form-group">
          <label>İsim</label>
          <input type="text" v-model="editProfile.name" class="form-input" placeholder="İsminizi girin" />
        </div>
        <div class="form-group">
          <label>Soyisim</label>
          <input type="text" v-model="editProfile.surname" class="form-input" placeholder="Soyisminizi girin" />
        </div>
        <div class="form-group">
          <label>Yaş</label>
          <input type="number" v-model="editProfile.age" class="form-input" placeholder="Yaşınızı girin" />
        </div>
        <div class="form-group">
          <label>Eğitim Seviyesi</label>
          <input type="text" v-model="editProfile.education_level" class="form-input" placeholder="Eğitim seviyenizi girin" />
        </div>
        <div class="form-group">
          <label>E-posta</label>
          <input type="email" v-model="editProfile.email" class="form-input" placeholder="E-posta adresiniz" />
        </div>
        <div class="form-actions">
          <button class="cancel-btn" @click="cancelEditing">Cancel</button>
          <button class="save-btn" :disabled="isLoading" @click="saveProfile">
            <span v-if="isLoading" class="loading-spinner"></span>
            Save
          </button>
        </div>
      </div>
  
      <!-- İstatistikler -->
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userProfile.completedStudies || 0 }}</span>
          <span class="stat-label">Tamamlanan Çalışma</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userProfile.rating || '0.0' }}</span>
          <span class="stat-label">Ortalama Puan</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userProfile.activeGroups || 0 }}</span>
          <span class="stat-label">Aktif Grup</span>
        </div>
      </div>
  
      <!-- İlgi Alanları -->
      <div class="profile-section">
        <h3>İlgi Alanları</h3>
        <div class="interests-container">
          <div v-for="(interest, index) in userProfile.interests" :key="index" class="interest-tag">
            {{ interest }}
          </div>
        </div>
      </div>
  
      <!-- Hesap Ayarları -->
      <div class="profile-section">
        <h3>Hesap Ayarları</h3>
        <div class="settings-container">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Şifre Değiştir</h4>
              <p>Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin</p>
            </div>
            <button class="setting-btn">Değiştir</button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Bildirim Ayarları</h4>
              <p>E-posta ve uygulama bildirimlerini yönetin</p>
            </div>
            <button class="setting-btn">Düzenle</button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Hesabı Sil</h4>
              <p>Hesabınızı kalıcı olarak silin</p>
            </div>
            <button class="delete-account-btn" @click="confirmDeleteAccount">Hesabı Sil</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  const userStore = useUserStore();
  
  const userProfile = ref({
    id: null,
    name: null,
    surname: null,
    email: null,
    age: null,
    education_level: null,
    created_at: null,
    updated_at: null,
  });
  
  const editProfile = ref({ ...userProfile.value });
  const isEditingProfile = ref(false);
  
  onMounted(async () => {
    const userId = userStore.id;
    if (!userId) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/user/${userId}`);
      const data = await response.json();
      if (data && data.user) {
        userProfile.value = {
          id: data.user.id ?? null,
          name: data.user.name ?? null,
          surname: data.user.surname ?? null,
          email: data.user.email ?? null,
          age: data.user.age ?? null,
          education_level: data.user.education_level ?? null,
          created_at: data.user.created_at ?? null,
          updated_at: data.user.updated_at ?? null,
        };
        editProfile.value = { ...userProfile.value };
      }
    } catch (e) {
      console.error("Profil bilgileri alınamadı:", e);
    }
  });
  
  const cancelEditing = () => {
    isEditingProfile.value = false;
    editProfile.value = { ...userProfile.value };
  };
  
  const saveProfile = async () => {
    try {
      userProfile.value = { ...editProfile.value };
      isEditingProfile.value = false;
      alert('Profil başarıyla güncellendi!');
    } catch (error) {
      alert('Profil güncellenirken bir hata oluştu.');
    }
  };
  
  const confirmDeleteAccount = () => {
    if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      alert('Hesap silme işlemi başlatıldı.');
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  
  .profile-container {
    background: rgba(30, 22, 54, 0.85);
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    color: white;
  }
  
  .profile-header {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }
  
  .profile-avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #7E57C2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: white;
    overflow: hidden;
  }
  
  .edit-profile-btn,
  .cancel-btn,
  .save-btn {
    background: #7E57C2;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;
  }
  
  .edit-profile-btn:hover,
  .save-btn:hover {
    background: #4527A0;
  }
  
  .cancel-btn {
    background: #F44336;
  }
  
  .cancel-btn:hover {
    background: #D32F2F;
  }
  
  .profile-edit-form {
    background: rgba(45, 35, 75, 0.9);
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background: rgba(45, 35, 75, 0.9);
    color: white;
  }
  
  .profile-stats,
  .settings-container {
    display: flex;
    gap: 1rem;
  }
  
  .stat-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    flex: 1;
  }
  
  .interests-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .interest-tag {
    background: #7E57C2;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
  }
  </style>
  