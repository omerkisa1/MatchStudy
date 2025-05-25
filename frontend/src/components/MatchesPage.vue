<template>
    <div class="matches-container">
      <h2>Eşleşmeler</h2>
      <!-- Eşleşme Oluşturma Formu (Admin veya test amaçlı) -->
      <form @submit.prevent="createMatch">
        <label>Kullanıcı 1 ID:</label>
        <input v-model="matchForm.user1_id" required />
        <label>Kullanıcı 2 ID:</label>
        <input v-model="matchForm.user2_id" required />
        <label>Request ID:</label>
        <input v-model="matchForm.request_id" required />
        <button type="submit">Eşleşme Oluştur</button>
      </form>
  
      <!-- Eşleşmeler Listesi -->
      <div>
        <h3>Tüm Eşleşmeler</h3>
        <ul>
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
  import axios from "axios";
  
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
      };
    },
    async created() {
      await this.fetchMatches();
    },
    methods: {
      async createMatch() {
        try {
          const response = await axios.post("${import.meta.env.VITE_APP_API_URL}/matches/create", {
            user1_id: this.matchForm.user1_id,
            user2_id: this.matchForm.user2_id,
            request_id: this.matchForm.request_id,
          });
          alert(response.data.message);
          await this.fetchMatches();
        } catch (error) {
          console.error(error);
          alert("Eşleşme oluşturulamadı!");
        }
      },
      async fetchMatches() {
        try {
          const response = await axios.get("${import.meta.env.VITE_APP_API_URL}/matches/list");
          this.matches = response.data.matches || [];
        } catch (error) {
          console.error(error);
        }
      },
      async deleteMatch(matchId) {
        if (!confirm("Bu eşleşmeyi silmek istediğinize emin misiniz?")) return;
        try {
          const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/matches/delete/${matchId}`);
          alert(response.data.message);
          await this.fetchMatches();
        } catch (error) {
          console.error(error);
          alert("Eşleşme silinemedi!");
        }
      },
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
  </style>
  