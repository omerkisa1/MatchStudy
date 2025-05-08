import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue";
import LoginPage from "../components/LoginPage.vue";
import HistoryPage from "../components/HistoryPage.vue";

const routes = [
  { path: "/home", name: "Home", component: HomePage },
  { path: "/", name: "Login", component: LoginPage },
  { path: "/history", name: "History", component: HistoryPage },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/RegisterPage.vue')
  },
  {
    path: '/signup',
    redirect: '/register'
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
