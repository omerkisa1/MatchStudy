<template>
  <div class="login-container">
    <h2>Giriş Yap</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="Email adresinizi girin"
          required
        />
      </div>

      <div>
        <label for="password">Şifre:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Şifrenizi girin"
          required
        />
      </div>

      <button type="submit">Giriş</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {

async handleLogin() {
  try {
    const response = await axios.post("http://127.0.0.1:8000/users/login", {
      email: this.email,
      password: this.password,
    });

    console.log("Giriş Başarılı, Token:", response.data.token);
    localStorage.setItem("token", response.data.token);
    alert("Giriş başarılı!");
    this.$router.push("/");
  } catch (err) {
    console.error(err);
    alert("Giriş başarısız, bilgilerinizi kontrol edin!");
  }
}

  },
};
</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 0 auto;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: inline-block;
  margin-bottom: 0.25rem;
}
</style>
