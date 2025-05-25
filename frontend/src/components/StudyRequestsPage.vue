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
        <ul>
          <li v-for="request in requests" :key="request.id">
            <strong>{{ request.topic }}</strong> - {{ request.category }} 
            ({{ request.study_date }}) 
            <button @click="deleteRequest(request.id)">Sil</button>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "StudyRequestsPage",
    data() {
      return {
        form: {
          user_id: 0, // Giriş yapan kullanıcının ID'si (token'dan çözülebilir)
          category: "",
          duration: "",
          studyDate: "",
          topic: "",
          note: "",
        },
        requests: [],
      };
    },
    async created() {
      await this.fetchRequests();
    },
    methods: {
      async createRequest() {
        try {
          // Örnek user_id = 1 (gerçekte login kullanıcıdan çekilmeli)
          this.form.user_id = 1;
          const response = await axios.post("${import.meta.env.VITE_APP_API_URL}/study-requests/create", {
            user_id: this.form.user_id,
            category: this.form.category,
            duration: this.form.duration,
            study_date: this.form.studyDate,
            topic: this.form.topic,
            note: this.form.note,
          });
          alert(response.data.message);
          await this.fetchRequests();
        } catch (error) {
          console.error(error);
          alert("İstek oluşturulamadı.");
        }
      },
      async fetchRequests() {
        try {
          const response = await axios.get("${import.meta.env.VITE_APP_API_URL}/study-requests/list");
          this.requests = response.data.requests || [];
        } catch (error) {
          console.error(error);
        }
      },
      async deleteRequest(requestId) {
        if (!confirm("Bu isteği silmek istediğinize emin misiniz?")) return;
        try {
          const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/study-requests/delete/${requestId}`);
          alert(response.data.message);
          await this.fetchRequests();
        } catch (error) {
          console.error(error);
          alert("İstek silinemedi.");
        }
      },
    },
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
  