<template>
  <div>
    <header>
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
