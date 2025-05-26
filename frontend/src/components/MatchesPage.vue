<template>
    <div class="matches-container">
      <h2>Eşleşmeler</h2>
      
      <!-- Hata Durumu -->
      <div v-if="error" class="error-message">
        <p>{{ errorMessage }}</p>
        <button @click="retryFetch" class="retry-button">Tekrar Dene</button>
      </div>
      
      <!-- Yükleniyor İndikatörü -->
      <div v-if="loading" class="loading">
        Yükleniyor...
      </div>
      
      <!-- Eşleşme Oluşturma Formu (Admin veya test amaçlı) -->
      <form v-if="!error && !loading" @submit.prevent="createMatch">
        <label>Kullanıcı 1 ID:</label>
        <input v-model="matchForm.user1_id" required />
        <label>Kullanıcı 2 ID:</label>
        <input v-model="matchForm.user2_id" required />
        <label>Request ID:</label>
        <input v-model="matchForm.request_id" required />
        <button type="submit">Eşleşme Oluştur</button>
      </form>
  
      <!-- Eşleşmeler Listesi -->
      <div v-if="!error && !loading">
        <h3>Tüm Eşleşmeler</h3>
        <div v-if="matches.length === 0" class="empty-state">
          Henüz eşleşme bulunmuyor.
        </div>
        <ul v-else>
          <li v-for="match in matches" :key="match.id">
            Eşleşme #{{ match.id }}: {{ match.user1_id }} - {{ match.user2_id }} 
            (Request: {{ match.request_id }})
            <button @click="deleteMatch(match.id)">Sil</button>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { matchesApi } from "@/services/api";
  
  export default {
    name: "MatchesPage",
    data() {
      return {
        matchForm: {
          user1_id: "",
          user2_id: "",
          request_id: "",
        },
        matches: [],
        loading: false,
        error: false,
        errorMessage: ""
      };
    },
    async created() {
      this.loading = true;
      await this.fetchMatches();
      this.loading = false;
    },
    methods: {
      async createMatch() {
        try {
          this.loading = true;
          this.error = false;
          
          const response = await matchesApi.createMatch({
            user1_id: this.matchForm.user1_id,
            user2_id: this.matchForm.user2_id,
            request_id: this.matchForm.request_id,
          });
          
          alert(response.message);
          await this.fetchMatches();
        } catch (error) {
          console.error(error);
          this.setError("Eşleşme oluşturulamadı!");
        } finally {
          this.loading = false;
        }
      },
      async fetchMatches() {
        try {
          this.error = false;
          const response = await matchesApi.getAllMatches();
          this.matches = response.matches || [];
        } catch (error) {
          console.error(error);
          this.setError("Eşleşmeler yüklenirken bir hata oluştu.");
        }
      },
      async deleteMatch(matchId) {
        if (!confirm("Bu eşleşmeyi silmek istediğinize emin misiniz?")) return;
        
        try {
          this.loading = true;
          this.error = false;
          
          const response = await matchesApi.deleteMatch(matchId);
          alert(response.message);
          await this.fetchMatches();
        } catch (error) {
          console.error(error);
          this.setError("Eşleşme silinemedi!");
        } finally {
          this.loading = false;
        }
      },
      retryFetch() {
        this.loading = true;
        this.error = false;
        this.fetchMatches().finally(() => {
          this.loading = false;
        });
      },
      setError(message) {
        this.error = true;
        this.errorMessage = message || "Bir hata oluştu, lütfen daha sonra tekrar deneyin.";
      }
    },
  };
  </script>
  
  <style scoped>
  .matches-container {
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
  .error-message {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(244, 67, 54, 0.3);
    margin-bottom: 1rem;
    text-align: center;
  }
  .retry-button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0.5rem;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
  .empty-state {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    padding: 2rem;
  }
  </style>
  