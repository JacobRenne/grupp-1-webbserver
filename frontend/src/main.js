import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./view/HomeView.vue";
import MovieView from "./view/MovieView.vue";
import ProfileView from "./view/ProfileView.vue";
import LoginView from "./view/LoginView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      component: HomeView,
      path: "/"
    },
    {
      component: LoginView,
      path: "/login"
    },
    {
      component: ProfileView,
      path: "/profile"
    },
    {
      component: MovieView,
      path: "/movie"
    }
  ]
});

const app = createApp(App)

app.use(router);

app.mount("#app");
