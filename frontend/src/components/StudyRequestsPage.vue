<template>
    <div class="study-requests-container">
      <h2>Çalışma İstekleri</h2>
  
      <!-- İstek Oluşturma Formu -->
      <form @submit.prevent="createRequest">
        <label>Kategori:</label>
        <input v-model="form.category" required />
  
        <label>Süre:</label>
        <input v-model="form.duration" required />
  
        <label>Tarih:</label>
        <input v-model="form.studyDate" type="date" required />
  
        <label>Konu:</label>
        <input v-model="form.topic" required />
  
        <label>Not:</label>
        <textarea v-model="form.note"></textarea>
  
        <button type="submit">İstek Oluştur</button>
      </form>
  
      <!-- İstekler Listesi -->
      <div class="requests-list">
        <h3>Mevcut İstekler</h3>
        <div v-if="isLoading">Yükleniyor...</div>
        <ul v-else>
          <li v-for="request in userRequests" :key="request.request_id">
            <strong>{{ request.topic }}</strong> - {{ request.category }} 
            ({{ request.study_date }}) 
            <button @click="deleteRequest(request.request_id)">Sil</button>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { useStudyRequestsStore } from '../stores/studyRequestsStore';
  import { useUserStore } from '../stores/userStore';
  import { computed } from 'vue';
  
  export default {
    name: "StudyRequestsPage",
    setup() {
      const studyRequestsStore = useStudyRequestsStore();
      const userStore = useUserStore();
      
      const form = {
        category: "",
        duration: "",
        studyDate: "",
        topic: "",
        note: "",
      };
      
      // Fetch user requests when component is created
      studyRequestsStore.fetchUserRequests();
      
      const userRequests = computed(() => studyRequestsStore.userRequests);
      const isLoading = computed(() => studyRequestsStore.isLoading);
      
      async function createRequest() {
        const result = await studyRequestsStore.createRequest({
          user_id: userStore.id,
          category: form.category,
          duration: form.duration,
          study_date: form.studyDate,
          topic: form.topic,
          note: form.note,
        });
        
        if (result.success) {
          alert("Çalışma isteği başarıyla oluşturuldu!");
          // Form alanlarını temizle
          form.category = "";
          form.duration = "";
          form.studyDate = "";
          form.topic = "";
          form.note = "";
        } else {
          alert("İstek oluşturulamadı: " + (result.error || "Bilinmeyen bir hata oluştu."));
        }
      }
      
      async function deleteRequest(requestId) {
        if (!confirm("Bu isteği silmek istediğinize emin misiniz?")) return;
        
        try {
          const response = await fetch(`https://matchstudy-production.up.railway.app/study_requests/delete/${requestId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            // Başarılıysa, kullanıcı isteklerini yeniden yükle
            await studyRequestsStore.fetchUserRequests();
            alert("İstek başarıyla silindi.");
          } else {
            alert("İstek silinemedi.");
          }
        } catch (error) {
          console.error(error);
          alert("İstek silinemedi.");
        }
      }
      
      return {
        form,
        userRequests,
        isLoading,
        createRequest,
        deleteRequest
      };
    }
  };
  </script>
  
  <style scoped>
  .study-requests-container {
    max-width: 600px;
    margin: 0 auto;
    text-align: left;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  ul {
    list-style: none;
    padding-left: 0;
  }
  </style>
  