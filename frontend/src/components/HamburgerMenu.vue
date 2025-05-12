<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}
</script>

<template>
  <div id="Menu">
    <!-- Mobile overlay -->
    <div v-if="isMenuOpen" id="backgroundOverlay" @click="closeMenu" />

    <!-- Menu button (mobile only) -->
    <button @click="toggleMenu" id="toggleMenuBtn" class="mobile-only">Menu</button>

    <!-- Desktop menu (always visible on large screens) -->
    <ul class="desktop-menu">
      <li><router-link to="/movie">All Movies</router-link></li>
      <li><router-link to="/top-movies">Top Movies</router-link></li>
      <li><router-link to="/popular-movies">Popular Movies</router-link></li>
      <li><router-link to="/createAccount">Sign up</router-link></li>
    </ul>

    <!-- Mobile menu (only shown when toggled) -->
    <div v-if="isMenuOpen" class="OpenMenu mobile-only">
      <ul>
        <li><router-link to="/movie" @click="closeMenu()">All Movies</router-link></li>
        <li><router-link to="/top-movies" @click="closeMenu()">Top Movies</router-link></li>
        <li><router-link to="/popular-movies" @click="closeMenu()">Popular Movies</router-link></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Common menu styling */
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
  color: hsla(160, 100%, 37%, 1);
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

/* Desktop menu: visible only on larger screens */
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

/* Mobile menu: full-screen overlay style */
.OpenMenu {
  position: absolute;
  top: 50px;
  background-color: #212529;
  width: 100%;
  z-index: 10;
}

/* Background overlay */
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
