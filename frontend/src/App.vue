<template>
  <div>
    <header>
      <h1>MatchStudy</h1>
      <nav>
        <router-link to="/">Ana Sayfa</router-link> |
        <router-link to="/login">Giriş Yap</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import LoginPage from "./components/LoginPage.vue";

export default {
  name: "App",
  components: {
    LoginPage,
  },
};
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}
</style>
