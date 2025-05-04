<template>
  <div class="content-wrapper">
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <span v-if="!userProfile.avatar">{{ userInitial }}</span>
            <img v-else :src="userProfile.avatar" alt="Profil Fotoğrafı" />
          </div>
          <button class="edit-avatar-btn" @click="triggerFileInput">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Fotoğraf Yükle
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept="image/*"
            @change="handleAvatarChange"
          />
        </div>

        <div class="profile-info">
          <div class="profile-name-section">
            <div>
              <h2>{{ userProfile.name || 'İsimsiz Kullanıcı' }}</h2>
              <p class="profile-education">
                {{ userProfile.university || 'Üniversite' }} - 
                {{ userProfile.department || 'Bölüm' }}
              </p>
            </div>
            <button class="edit-profile-btn" @click="isEditingProfile = true" v-if="!isEditingProfile">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Profili Düzenle
            </button>
          </div>

          <div v-if="!isEditingProfile">
            <p class="profile-bio">{{ userProfile.bio || 'Henüz bir biyografi eklenmemiş.' }}</p>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ userProfile.completedStudies }}</span>
                <span class="stat-label">Tamamlanan Çalışma</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ userProfile.rating }}</span>
                <span class="stat-label">Ortalama Puan</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ userProfile.activeGroups }}</span>
                <span class="stat-label">Aktif Grup</span>
              </div>
            </div>

            <div class="interests-section">
              <h3>İlgi Alanları</h3>
              <div class="interests-container">
                <span v-for="interest in userProfile.interests" 
                      :key="interest" 
                      class="interest-tag">
                  {{ interest }}
                </span>
                <button class="add-interest-btn" @click="showInterestModal = true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  İlgi Alanı Ekle
                </button>
              </div>
            </div>
          </div>

          <div v-else class="profile-edit-form">
            <div class="form-group">
              <label>İsim</label>
              <input type="text" v-model="editProfile.name" class="form-input" />
            </div>
            <div class="form-group">
              <label>Üniversite</label>
              <input type="text" v-model="editProfile.university" class="form-input" />
            </div>
            <div class="form-group">
              <label>Bölüm</label>
              <input type="text" v-model="editProfile.department" class="form-input" />
            </div>
            <div class="form-group">
              <label>Biyografi</label>
              <textarea v-model="editProfile.bio" class="form-textarea"></textarea>
            </div>
            <div class="form-actions">
              <button class="cancel-btn" @click="cancelProfileEdit">İptal</button>
              <button class="save-btn" @click="saveProfileChanges">Kaydet</button>
            </div>
          </div>
        </div>
      </div>

      <div class="study-history">
        <h3>Çalışma Geçmişi</h3>
        <div v-if="userStudyRequests.length > 0">
          <div v-for="request in userStudyRequests" 
                :key="request.request_id" 
                class="history-card">
            <div class="history-card-header">
              <h4>{{ request.topic }}</h4>
              <span class="tag">{{ request.category }}</span>
            </div>
            <p>{{ request.note }}</p>
            <div class="history-card-footer">
              <div>
                <span class="date">{{ formatDate(request.study_date) }}</span>
                <span class="duration">{{ formatDuration(request.duration) }} saat</span>
              </div>
              <span :class="['status', (request.status || 'pending').toLowerCase()]">
                {{ request.status || 'Beklemede' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          Henüz bir çalışma geçmişiniz bulunmuyor.
        </div>
      </div>

      <div class="settings-container">
        <h3>Hesap Ayarları</h3>
        <div class="setting-item">
          <div class="setting-info">
            <h4>Şifre Değiştir</h4>
            <p>Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin</p>
          </div>
          <button class="setting-btn" @click="showPasswordModal = true">
            Şifre Değiştir
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Bildirim Ayarları</h4>
            <p>E-posta ve uygulama bildirimlerini yönetin</p>
          </div>
          <button class="setting-btn" @click="showNotificationSettings = true">
            Ayarları Düzenle
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Hesabı Sil</h4>
            <p>Hesabınızı kalıcı olarak silin</p>
          </div>
          <button class="delete-account-btn" @click="confirmDeleteAccount">
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: "ProfilePage",
  props: {
    userProfile: {
      type: Object,
      required: true
    },
    userStudyRequests: {
      type: Array,
      default: () => []
    }
  },
  emits: ['profileUpdated', 'avatarUpdated', 'passwordChangeRequested', 'deleteAccountRequested'],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const isEditingProfile = ref(false);
    const showInterestModal = ref(false);
    const showPasswordModal = ref(false);
    const showNotificationSettings = ref(false);
    const editProfile = ref({ ...props.userProfile });

    const userInitial = computed(() => {
      return props.userProfile.name ? props.userProfile.name.charAt(0).toUpperCase() : 'K';
    });

    // Format date
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    // Format duration
    const formatDuration = (duration) => {
      return duration;
    };

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleAvatarChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          // Dosya yükleme simülasyonu - gerçek uygulamada API'ye yüklenecek
          const reader = new FileReader();
          reader.onload = (e) => {
            emit('avatarUpdated', e.target.result);
          };
          reader.readAsDataURL(file);
          alert('Profil fotoğrafı başarıyla yüklendi!');
        } catch (error) {
          alert('Profil fotoğrafı yüklenirken bir hata oluştu.');
        }
      }
    };

    const cancelProfileEdit = () => {
      isEditingProfile.value = false;
      editProfile.value = { ...props.userProfile };
    };

    const saveProfileChanges = async () => {
      try {
        // API'ye profil güncelleme isteği gönderilecek
        emit('profileUpdated', { ...editProfile.value });
        isEditingProfile.value = false;
        alert('Profil başarıyla güncellendi!');
      } catch (error) {
        alert('Profil güncellenirken bir hata oluştu.');
      }
    };

    const confirmDeleteAccount = () => {
      if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        emit('deleteAccountRequested');
      }
    };

    return {
      fileInput,
      isEditingProfile,
      editProfile,
      showInterestModal,
      showPasswordModal,
      showNotificationSettings,
      userInitial,
      formatDate,
      formatDuration,
      triggerFileInput,
      handleAvatarChange,
      cancelProfileEdit,
      saveProfileChanges,
      confirmDeleteAccount
    };
  }
}
</script>

<style scoped>
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
  padding-bottom: 2rem;
}

.profile-container {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: var(--shadow-md);
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
  background: var(--primary-color);
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

.edit-avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.edit-avatar-btn svg {
  width: 16px;
  height: 16px;
}

.profile-info {
  flex: 1;
}

.profile-name-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.profile-name-section h2 {
  margin: 0;
  font-size: 1.75rem;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background: var(--primary-dark);
}

.edit-profile-btn svg {
  width: 16px;
  height: 16px;
}

.profile-education {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.profile-bio {
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
  background: var(--surface-color-light);
  padding: 1.5rem;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.interests-section {
  margin-top: 2rem;
}

.interests-section h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.interests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.interest-tag {
  background: rgba(126, 87, 194, 0.15);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid rgba(126, 87, 194, 0.3);
}

.add-interest-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-interest-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.add-interest-btn svg {
  width: 16px;
  height: 16px;
}

.profile-edit-form {
  background: var(--surface-color-light);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-family: inherit;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: var(--primary-dark);
}

.study-history {
  display: grid;
  gap: 1rem;
}

.study-history h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.history-card {
  background: var(--surface-color-light);
  border-radius: 8px;
  padding: 1rem;
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-card-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.history-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.date, .duration {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  background: #FFC107;
  color: black;
}

.status.pending {
  background: #FFC107;
  color: black;
}

.status.completed {
  background: #4CAF50;
  color: white;
}

.status.cancelled {
  background: #F44336;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--surface-color-light);
  border-radius: 12px;
  margin: 1rem 0;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-color-light);
  border-radius: 8px;
}

.setting-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.setting-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.setting-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-btn:hover {
  background: var(--primary-dark);
}

.delete-account-btn {
  padding: 0.5rem 1rem;
  background: #F44336;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-account-btn:hover {
  background: #D32F2F;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-name-section {
    flex-direction: column;
    gap: 1rem;
  }

  .profile-stats {
    grid-template-columns: 1fr;
  }

  .setting-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style> 