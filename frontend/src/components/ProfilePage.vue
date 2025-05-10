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
          <AvatarUpload
            :avatar-url="profile.avatar"
            :initial="userInitial"
            :is-uploading="isUploading"
            :upload-progress="uploadProgress"
            :error="error"
            @file-selected="handleAvatarChange"
            @upload-error="error = $event"
          />
        </div>

        <div class="profile-info">
          <div class="profile-name-section">
            <div>
              <h2>{{ profile.name || 'Unnamed User' }}</h2>
              <p class="profile-education">
                {{ profile.institution || 'Institution' }} - 
                {{ profile.education_level || 'Education Level' }}
              </p>
            </div>
            <button class="edit-profile-btn" @click="startEditing" v-if="!isEditing">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </button>
          </div>

          <div v-if="!isEditing">
            <p class="profile-bio">{{ profile.bio || 'Henüz biyografi eklenmemiş.' }}</p>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ profile.completedStudies }}</span>
                <span class="stat-label">Completed Studies</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profile.rating }}</span>
                <span class="stat-label">Average Rating</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profile.activeGroups }}</span>
                <span class="stat-label">Active Groups</span>
              </div>
            </div>

            <div class="interests-section">
              <h3>Interests</h3>
              <div class="interests-container">
                <div v-for="interest in interests" :key="interest" class="interest-tag">
                  {{ interest }}
                  <button class="remove-interest-btn" @click="handleRemoveInterest(interest)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <button class="add-interest-btn" @click="showInterestModal = true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Interest
                </button>
              </div>
            </div>
          </div>

          <div v-else class="profile-edit-form">
            <div class="form-group">
              <label>Name</label>
              <input type="text" v-model="profileForm.name" class="form-input" />
            </div>
            <div class="form-group">
              <label>Surname</label>
              <input type="text" v-model="profileForm.surname" class="form-input" />
            </div>
            <div class="form-group">
              <label>Age</label>
              <input type="number" v-model.number="profileForm.age" class="form-input" />
            </div>
            <div class="form-group">
              <label>Education Level</label>
              <select v-model="profileForm.education_level" class="form-input">
                <option value="">Select Education Level</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div class="form-group">
              <label>Institution</label>
              <input type="text" v-model="profileForm.institution" class="form-input" />
            </div>
            <div class="form-actions">
              <button class="cancel-btn" @click="cancelEditing">Cancel</button>
              <button class="save-btn" :disabled="isLoading" @click="saveProfile">
                <span v-if="isLoading" class="loading-spinner"></span>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Biyografi Bölümü -->
      <div class="bio-section">
        <h3>Biography</h3>
        <div v-if="!isEditing" class="bio-content">
          <p class="profile-bio">{{ profile.bio || 'Henüz biyografi eklenmemiş.' }}</p>
          <button class="edit-bio-btn" @click="startEditing">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Biyografiyi Düzenle
          </button>
        </div>
        <div v-else class="bio-edit-form">
          <textarea v-model="profileForm.bio" class="bio-textarea" placeholder="Biyografinizi yazın..."></textarea>
          <div class="bio-actions">
            <button class="cancel-btn" @click="cancelEditing">İptal</button>
            <button class="save-btn" :disabled="isLoading" @click="saveProfile">
              <span v-if="isLoading" class="loading-spinner"></span>
              Kaydet
            </button>
          </div>
        </div>
      </div>

      <div class="study-history">
        <h3>Study History</h3>
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
                <span class="duration">{{ formatDuration(request.duration) }}</span>
              </div>
              <span :class="['status', (request.status || 'pending').toLowerCase()]">
                {{ request.status || 'Pending' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          You don't have any study history yet.
        </div>
      </div>

      <div class="settings-container">
        <h3>Account Settings</h3>
        <div class="setting-item">
          <div class="setting-info">
            <h4>Change Password</h4>
            <p>Change your password regularly for better security</p>
          </div>
          <button class="setting-btn" @click="showPasswordModal = true">
            Change Password
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Notification Settings</h4>
            <p>Manage email and application notifications</p>
          </div>
          <button class="setting-btn" @click="showNotificationSettings = true">
            Edit Settings
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Delete Account</h4>
            <p>Permanently delete your account</p>
          </div>
          <div class="delete-account-section">
            <input
              v-if="showDeleteConfirm"
              type="text"
              v-model="confirmDeleteText"
              placeholder="Type 'DELETE' to confirm"
              class="delete-confirm-input"
            />
            <button 
              class="delete-account-btn" 
              @click="showDeleteConfirm ? confirmDeleteAccount() : showDeleteConfirm = true">
              {{ showDeleteConfirm ? 'Confirm' : 'Delete Account' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Interest Modal -->
    <InterestModal
      v-model="showInterestModal"
      title="Add Interest"
      placeholder="Enter an interest..."
      :suggestions="interestSuggestions"
      :existing-interests="profile.interests"
      @submit="handleAddInterest"
    />
    
    <!-- Password Modal -->
    <PasswordModal
      v-model="showPasswordModal"
      :is-loading="isLoading"
      :error="error"
      @submit="handlePasswordChange"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useProfile } from '../composables/useProfile';
import { useStudyRequests } from '../composables/useStudyRequests';
import InterestTags from './InterestTags.vue';
import AvatarUpload from './AvatarUpload.vue';
import InterestModal from './InterestModal.vue';
import PasswordModal from './PasswordModal.vue';

export default {
  name: "ProfilePage",
  components: {
    InterestTags,
    AvatarUpload,
    InterestModal,
    PasswordModal
  },
  setup() {
    // Use profile composable
    const { 
      isLoading,
      error,
      success,
      isEditing,
      isUploading,
      uploadProgress,
      profileForm,
      profile,
      userInitial,
      interests,
      
      // Methods
      initialize,
      startEditing,
      cancelEditing,
      saveProfile,
      handleAvatarChange,
      addInterest,
      removeInterest,
      changePassword,
      deleteAccount,
      fetchInterests
    } = useProfile();
    
    // Study requests
    const { getUserRequests, formatDate, formatDuration } = useStudyRequests();
    const userRequests = ref([]);
    
    // UI state
    const showInterestModal = ref(false);
    const showPasswordModal = ref(false);
    const showNotificationSettings = ref(false);
    const showDeleteConfirm = ref(false);
    const confirmDeleteText = ref('');
    
    // Interest suggestions
    const interestSuggestions = [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'History', 'Literature', 'Philosophy', 'Psychology', 'Sociology',
      'Economics', 'Business', 'Law', 'Medicine', 'Engineering'
    ];
    
    // Initialize
    onMounted(async () => {
      await initialize();
      await loadUserRequests();
    });
    
    // Load user's study requests
    const loadUserRequests = async () => {
      userRequests.value = await getUserRequests();
    };
    
    // Handle interest submission from modal
    const handleAddInterest = async (interest) => {
      const result = await addInterest(interest);
      if (result.success) {
        await fetchInterests();
        showInterestModal.value = false;
      }
    };
    
    // Handle interest removal
    const handleRemoveInterest = async (interest) => {
      const result = await removeInterest(interest);
      if (result.success) {
        await fetchInterests();
      }
    };
    
    // Handle password change from modal
    const handlePasswordChange = async (passwordData) => {
      await changePassword(passwordData);
    };
    
    // Confirm account deletion
    const confirmDeleteAccount = async () => {
      if (confirmDeleteText.value === 'DELETE') {
        await deleteAccount(confirmDeleteText.value);
        confirmDeleteText.value = '';
        showDeleteConfirm.value = false;
      } else {
        error.value = 'Please type DELETE to confirm account deletion';
      }
    };
    
    return {
      // Profile state
      isLoading,
      error,
      success,
      isEditing,
      isUploading,
      uploadProgress,
      profileForm,
      profile,
      userInitial,
      interests,
      
      // Study requests
      userRequests,
      formatDate,
      formatDuration,
      
      // UI state
      showInterestModal,
      showPasswordModal,
      showNotificationSettings,
      showDeleteConfirm,
      confirmDeleteText,
      interestSuggestions,
      
      // Methods
      startEditing,
      cancelEditing,
      saveProfile,
      handleAvatarChange,
      handleRemoveInterest,
      handleAddInterest,
      handlePasswordChange,
      confirmDeleteAccount
    };
  }
}
</script>

<style scoped>
.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(30, 22, 54, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message, .success-message {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.error-message {
  background-color: rgba(220, 53, 69, 0.15);
  color: #ff8a8a;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.success-message {
  background-color: rgba(25, 135, 84, 0.15);
  color: #a3ffcb;
  border: 1px solid rgba(25, 135, 84, 0.3);
}

.profile-container {
  background: var(--surface-color);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-header {
  display: flex;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-avatar-section {
  margin-right: 2rem;
}

.profile-info {
  flex: 1;
}

.profile-name-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.profile-name-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: 600;
}

.profile-education {
  color: var(--text-secondary);
  margin: 0;
}

.profile-bio {
  margin-bottom: 1.5rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.edit-profile-btn, .setting-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-profile-btn:hover, .setting-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.edit-profile-btn svg {
  width: 16px;
  height: 16px;
}

.profile-stats {
  display: flex;
  margin-bottom: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  gap: 1rem;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 1rem;
  background: rgba(45, 35, 75, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.interests-section {
  margin-bottom: 1.5rem;
}

.interests-section h3 {
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-weight: 600;
}

.interests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.interest-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(126, 87, 194, 0.2);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid rgba(126, 87, 194, 0.3);
  transition: all 0.2s;
}

.interest-tag:hover {
  background: rgba(126, 87, 194, 0.3);
  transform: translateY(-2px);
}

.remove-interest-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.remove-interest-btn:hover {
  opacity: 1;
  color: #ff8a8a;
}

.add-interest-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(126, 87, 194, 0.2);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px dashed rgba(126, 87, 194, 0.3);
  cursor: pointer;
  transition: all 0.2s;
}

.add-interest-btn:hover {
  background: rgba(126, 87, 194, 0.3);
  transform: translateY(-2px);
}

.profile-edit-form {
  margin-top: 1rem;
  background: rgba(45, 35, 75, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(30, 22, 54, 0.6);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
}

.form-textarea {
  height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cancel-btn, .save-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}

.cancel-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.save-btn:disabled {
  background-color: rgba(126, 87, 194, 0.5);
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.study-history {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.study-history h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-weight: 600;
}

.history-card {
  background: rgba(45, 35, 75, 0.3);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.history-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.history-card-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.tag {
  background-color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  color: white;
}

.history-card p {
  margin-bottom: 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.history-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.date, .duration {
  margin-right: 1rem;
  color: var(--text-secondary);
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
}

.status.pending {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffd866;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status.completed {
  background-color: rgba(25, 135, 84, 0.2);
  color: #a3ffcb;
  border: 1px solid rgba(25, 135, 84, 0.3);
}

.status.cancelled {
  background-color: rgba(220, 53, 69, 0.2);
  color: #ff8a8a;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: rgba(45, 35, 75, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.settings-container {
  padding: 2rem;
}

.settings-container h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-weight: 600;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(45, 35, 75, 0.2);
  border-radius: 12px;
  margin-bottom: 1rem;
  backdrop-filter: blur(5px);
}

.setting-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-weight: 600;
}

.setting-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.delete-account-section {
  display: flex;
  gap: 0.5rem;
}

.delete-confirm-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(30, 22, 54, 0.6);
  color: var(--text-primary);
  font-family: inherit;
}

.delete-account-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-account-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
  }
  
  .profile-avatar-section {
    margin-right: 0;
    margin-bottom: 1.5rem;
    align-self: center;
  }
  
  .profile-name-section {
    flex-direction: column;
  }
  
  .edit-profile-btn {
    margin-top: 1rem;
    align-self: flex-start;
  }
  
  .profile-stats {
    flex-direction: column;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .setting-btn, .delete-account-section {
    margin-top: 0.75rem;
  }
}

.bio-section {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(45, 35, 75, 0.3);
  border-radius: 12px;
  margin: 0 2rem;
  backdrop-filter: blur(5px);
}

.bio-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.bio-content {
  position: relative;
}

.profile-bio {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  padding: 1rem;
  background: rgba(30, 22, 54, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.edit-bio-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-bio-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.edit-bio-btn svg {
  width: 16px;
  height: 16px;
}

.bio-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bio-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(30, 22, 54, 0.6);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
}

.bio-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style> 