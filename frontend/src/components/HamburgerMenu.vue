<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  if ((isMenuOpen.value = true)) {
    isMenuOpen.value = !isMenuOpen.value;
  }
}
</script>

<template>
  <div id="Menu">
    <div v-if="!isMenuOpen" class="collapse" id="backgroundOverlay" />
    <div v-if="isMenuOpen" id="backgroundOverlay" @click="closeMenu" />
    <button @click="toggleMenu" id="toggleMenuBtn">Menu</button>
    <div v-if="isMenuOpen" class="OpenMenu">
      <ul>
        <li><router-link to="/movies">Movies</router-link></li>
        <li>Actors</li>
        <li>Directors</li>
        <li>Genres</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
ul {
  display: inline;
  list-style: none;
  background-color: #212529;
  color: whitesmoke;
  position: absolute;
  padding-left: 0;
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
</style>
