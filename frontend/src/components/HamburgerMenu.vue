<script setup>
import { useAuthStore } from '@/stores/useAuthStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const isMenuOpen = ref(false);
const router = useRouter();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const logout = () => {
  auth.logout();
  closeMenu();
  router.push('/login');
};
</script>


<template>
  <div id="Menu">
    <div v-if="isMenuOpen" id="backgroundOverlay" @click="closeMenu" />

    <button @click="toggleMenu" id="toggleMenuBtn" class="mobile-only">Menu</button>

    <ul class="desktop-menu">
      <li><router-link to="/movie">All Movies</router-link></li>
      <li><router-link to="/top-movies">Top Movies</router-link></li>
      <li><router-link to="/popular-movies">Popular Movies</router-link></li>

      <li v-if="auth.isLoggedIn">
        <router-link :to="`/user/${auth.userId}`">My Profile</router-link>
      </li>
      <li v-else>
        <router-link to="/login">Login</router-link>
      </li>
      <li v-if="auth.isLoggedIn">
        <a href="#" @click.prevent="logout">Logga ut</a>
      </li>
    </ul>

    <div v-if="isMenuOpen" class="OpenMenu mobile-only">
      <ul>
        <li><router-link to="/movie" @click="closeMenu()">All Movies</router-link></li>
        <li><router-link to="/top-movies" @click="closeMenu()">Top Movies</router-link></li>
        <li><router-link to="/popular-movies" @click="closeMenu()">Popular Movies</router-link></li>
        <li v-if="auth.isLoggedIn">
          <router-link :to="`/user/${auth.userId}`" @click="closeMenu()">My Profile</router-link>
        </li>
        <li v-if="!auth.isLoggedIn">
          <router-link to="/login" @click="closeMenu()">Logga in</router-link>
        </li>
        <li v-if="!auth.isLoggedIn">
          <router-link to="/signup" @click="closeMenu()">Skapa konto</router-link>
        </li>
        <li v-if="auth.isLoggedIn">
          <a href="#" @click.prevent="logout">Logga ut</a>
        </li>
      </ul>
    </div>
  </div>
</template>


<style scoped>
ul {
  list-style: none;
  background-color: #212529;
  color: whitesmoke;
  padding-left: 0;
  margin: 0;
}

li {
  font-size: medium;
  font-family: "Work Sans", sans-serif;
  padding: 10px;
}

li:hover {
  background-color: black;
  border-radius: 5%;
}

li > a {
  color: #8bc1db;
  text-decoration: none;
}

button {
  background-color: #212529;
  color: whitesmoke;
  border: none;
  border-radius: 10%;
  text-align: center;
  display: inline-block;
  font-size: medium;
  padding: 10px;
  font-family: "Cal Sans", sans-serif;
}

#Menu {
  position: relative;
}

.desktop-menu {
  display: none;
}

@media (min-width: 768px) {
  .desktop-menu {
    display: flex;
    gap: 1rem;
  }

  .mobile-only {
    display: none !important;
  }

  .OpenMenu {
    display: none !important;
  }
}

.OpenMenu {
  position: absolute;
  top: 50px;
  background-color: #212529;
  width: 100%;
  z-index: 10;
}

#backgroundOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 5;
}
</style>