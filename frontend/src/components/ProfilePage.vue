<template>
  <div class="content-wrapper">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader"></div>
    </div>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>
    
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <span v-if="!profile.avatar">{{ userInitial }}</span>
            <img v-else :src="profile.avatar" alt="Profil Fotoğrafı" />
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
          <div v-if="isUploading" class="upload-progress">
            Yükleniyor... {{ uploadProgress }}%
          </div>
        </div>

        <div class="profile-info">
          <div class="profile-name-section">
            <div>
              <h2>{{ profile.name || 'İsimsiz Kullanıcı' }}</h2>
              <p class="profile-education">
                {{ profile.university || 'Üniversite' }} - 
                {{ profile.department || 'Bölüm' }}
              </p>
            </div>
            <button class="edit-profile-btn" @click="startEditing" v-if="!isEditing">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Profili Düzenle
            </button>
          </div>

          <div v-if="!isEditing">
            <p class="profile-bio">{{ profile.bio || 'Henüz bir biyografi eklenmemiş.' }}</p>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ profile.completedStudies }}</span>
                <span class="stat-label">Tamamlanan Çalışma</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profile.rating }}</span>
                <span class="stat-label">Ortalama Puan</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profile.activeGroups }}</span>
                <span class="stat-label">Aktif Grup</span>
              </div>
            </div>

            <div class="interests-section">
              <h3>İlgi Alanları</h3>
              <div class="interests-container">
                <span v-for="interest in profile.interests" 
                      :key="interest" 
                      class="interest-tag">
                  {{ interest }}
                  <button class="remove-interest" @click="removeInterest(interest)">&times;</button>
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
              <input type="text" v-model="profileForm.name" class="form-input" />
            </div>
            <div class="form-group">
              <label>Üniversite</label>
              <input type="text" v-model="profileForm.university" class="form-input" />
            </div>
            <div class="form-group">
              <label>Bölüm</label>
              <input type="text" v-model="profileForm.department" class="form-input" />
            </div>
            <div class="form-group">
              <label>Biyografi</label>
              <textarea v-model="profileForm.bio" class="form-textarea"></textarea>
            </div>
            <div class="form-actions">
              <button class="cancel-btn" @click="cancelEditing">İptal</button>
              <button class="save-btn" @click="saveProfile">Kaydet</button>
            </div>
          </div>
        </div>
      </div>

      <div class="study-history">
        <h3>Çalışma Geçmişi</h3>
        <div v-if="userRequests.length > 0">
          <div v-for="request in userRequests" 
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
          <div class="delete-account-section">
            <input
              v-if="showDeleteConfirm"
              type="text"
              v-model="confirmDeleteText"
              placeholder="Onaylamak için 'DELETE' yazın"
              class="delete-confirm-input"
            />
            <button 
              class="delete-account-btn" 
              @click="showDeleteConfirm ? confirmDeleteAccount() : showDeleteConfirm = true">
              {{ showDeleteConfirm ? 'Onayla' : 'Hesabı Sil' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Interest Modal -->
    <div v-if="showInterestModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>İlgi Alanı Ekle</h3>
          <button class="close-btn" @click="showInterestModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <input 
            type="text" 
            v-model="newInterest" 
            class="form-input" 
            placeholder="İlgi alanınızı girin..."
            @keyup.enter="handleAddInterest"
          />
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showInterestModal = false">İptal</button>
          <button class="save-btn" @click="handleAddInterest">Ekle</button>
        </div>
      </div>
    </div>
    
    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Şifre Değiştir</h3>
          <button class="close-btn" @click="showPasswordModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Mevcut Şifre</label>
            <input type="password" v-model="currentPassword" class="form-input" />
          </div>
          <div class="form-group">
            <label>Yeni Şifre</label>
            <input type="password" v-model="newPassword" class="form-input" />
          </div>
          <div class="form-group">
            <label>Yeni Şifre (Tekrar)</label>
            <input type="password" v-model="confirmPassword" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showPasswordModal = false">İptal</button>
          <button class="save-btn" @click="handlePasswordChange({
            currentPassword,
            newPassword,
            confirmPassword
          })">Değiştir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useProfile } from '../composables/useProfile';
import { useStudyRequests } from '../composables/useStudyRequests';

export default {
  name: "ProfilePage",
  setup() {
    // Use composables
    const { 
      isLoading, 
      error, 
      success, 
      isEditing, 
      profileForm, 
      fileInput, 
      isUploading,
      uploadProgress,
      startEditing, 
      cancelEditing, 
      saveProfile, 
      triggerFileInput, 
      handleAvatarChange, 
      addInterest, 
      removeInterest, 
      changePassword, 
      deleteAccount, 
      userInitial, 
      profile 
    } = useProfile();

    const { userRequests, formatDate } = useStudyRequests();

    // New interest input
    const newInterest = ref('');
    const showInterestModal = ref(false);
    const showPasswordModal = ref(false);
    const showNotificationSettings = ref(false);
    const confirmDeleteText = ref('');
    const showDeleteConfirm = ref(false);
    
    // Password change form
    const currentPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');

    // Handle interest add
    const handleAddInterest = async () => {
      if (!newInterest.value.trim()) return;
      
      const result = await addInterest(newInterest.value);
      if (result?.success) {
        newInterest.value = '';
        showInterestModal.value = false;
      }
    };

    // Handle password change
    const handlePasswordChange = async (passwordData) => {
      const result = await changePassword(passwordData);
      if (result?.success) {
        showPasswordModal.value = false;
        // Reset the form
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
      }
    };

    // Handle confirm delete
    const confirmDeleteAccount = async () => {
      if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        const result = await deleteAccount(confirmDeleteText.value);
        if (result?.success) {
          // In a real app, this would navigate to the login page
          window.location.href = '/login';
        }
      }
    };

    // Format duration
    const formatDuration = (duration) => {
      return duration;
    };

    return {
      // From composables
      isLoading,
      error,
      success,
      isEditing,
      profileForm,
      fileInput,
      isUploading,
      uploadProgress,
      startEditing,
      cancelEditing,
      saveProfile,
      triggerFileInput,
      handleAvatarChange,
      userInitial,
      profile,
      userRequests,
      formatDate,
      
      // Local state and methods
      newInterest,
      showInterestModal,
      showPasswordModal,
      showNotificationSettings,
      confirmDeleteText,
      showDeleteConfirm,
      currentPassword,
      newPassword,
      confirmPassword,
      handleAddInterest,
      removeInterest,
      handlePasswordChange,
      confirmDeleteAccount,
      formatDuration
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

/* New styles for the composable approach */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader {
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top: 3px solid var(--primary-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.error-message, .success-message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.success-message {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.upload-progress {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface-color);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-account-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.delete-confirm-input {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border-radius: 4px;
}

.remove-interest {
  background: none;
  border: none;
  color: var(--text-secondary);
  margin-left: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
}

.remove-interest:hover {
  opacity: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 