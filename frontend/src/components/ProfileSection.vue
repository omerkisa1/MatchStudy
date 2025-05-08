<template>
    <div class="profile-container">
      <!-- Profil Başlığı ve Düzenleme -->
      <div class="profile-header">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <img v-if="userProfile.avatar" :src="userProfile.avatar" alt="Profil Fotoğrafı" />
            <span v-else>{{ userProfile.name?.[0]?.toUpperCase() || 'U' }}</span>
          </div>
          <button class="edit-avatar-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Fotoğraf Yükle
          </button>
        </div>
        <div class="profile-info">
          <div class="profile-name-section">
            <h2>{{ userProfile.name || 'İsimsiz Kullanıcı' }}</h2>
            <button class="edit-profile-btn" @click="isEditingProfile = true" v-if="!isEditingProfile">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Profili Düzenle
            </button>
          </div>
          <p class="profile-education">{{ userProfile.university }} / {{ userProfile.department }}</p>
          <p class="profile-bio">{{ userProfile.bio || 'Henüz bir biyografi eklenmemiş.' }}</p>
        </div>
      </div>
  
      <!-- Profil Düzenleme Formu -->
      <div v-if="isEditingProfile" class="profile-edit-form">
        <h3>Profil Bilgilerini Düzenle</h3>
        <div class="form-group">
          <label>İsim Soyisim</label>
          <input type="text" v-model="editProfile.name" class="form-input" placeholder="İsminizi girin" />
        </div>
        <div class="form-group">
          <label>Üniversite</label>
          <input type="text" v-model="editProfile.university" class="form-input" placeholder="Üniversitenizi girin" />
        </div>
        <div class="form-group">
          <label>Bölüm</label>
          <input type="text" v-model="editProfile.department" class="form-input" placeholder="Bölümünüzü girin" />
        </div>
        <div class="form-group">
          <label>Biyografi</label>
          <textarea v-model="editProfile.bio" class="form-textarea" placeholder="Kendinizden bahsedin..."></textarea>
        </div>
        <div class="form-group">
          <label>İletişim E-posta</label>
          <input type="email" v-model="editProfile.email" class="form-input" placeholder="E-posta adresiniz" />
        </div>
        <div class="form-actions">
          <button class="cancel-btn" @click="cancelProfileEdit">İptal</button>
          <button class="save-btn" @click="saveProfileChanges">Değişiklikleri Kaydet</button>
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
    // Sadece users tablosundaki alanlar!
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
  
  const cancelProfileEdit = () => {
    isEditingProfile.value = false;
    editProfile.value = { ...userProfile.value };
  };
  
  const saveProfileChanges = async () => {
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
  
  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .edit-avatar-btn,
  .edit-profile-btn,
  .setting-btn,
  .delete-account-btn,
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
  
  .edit-avatar-btn:hover,
  .edit-profile-btn:hover,
  .setting-btn:hover,
  .save-btn:hover {
    background: #4527A0;
  }
  
  .delete-account-btn {
    background: #F44336;
  }
  
  .delete-account-btn:hover {
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
  
  .form-input,
  .form-textarea {
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
  