<template>
  <div>
    <ApiStatus />
    <header>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import LoginPage from "./components/LoginPage.vue";
import ApiStatus from "./components/ApiStatus.vue";

export default {
  name: "App",
  components: {
    LoginPage,
    ApiStatus,
  },
};
</script>

<style>
/* Reset CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #1A1033;
  color: rgba(255, 255, 255, 0.9);
  min-height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* Genel stil tanımlamaları */
h1, h2, h3, h4, h5, h6 {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  line-height: 1.2;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.75rem;
  margin-bottom: 1.25rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 1rem;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar style */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
