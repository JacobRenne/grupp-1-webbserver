<script setup>
import HamburgerMenu from "./components/HamburgerMenu.vue";
import SearchBar from "./components/SearchBar.vue";
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <nav>
      <a id="icon" href="/">FMDb</a>
      <ul>
        <li><HamburgerMenu /></li>
        <li><SearchBar /></li>
        <li><router-link to="/profile">Profile</router-link></li>
      </ul>
    </nav>
  </header>
  <main>
    <router-view></router-view>
  </main>
</template>

<style scoped>
header {
  background: #000814;
  color: whitesmoke;
  width: 100%;
  height: 80px;
  position: absolute;
  top: 0;
  left: 0;
}

ul {
  display: flex;
  flex-direction: row;
  list-style: none;
  justify-content: center;
  margin: 10px;
  margin-right: 5%;
  height: 100%;
  padding: 0;
  width: auto;
}

li {
  font-family: "Cal Sans", sans-serif;
  padding-inline: 20px;
}

nav {
  justify-content: space-between;
  display: flex;
  height: 100%;
  align-items: baseline;
  padding: 15px;
}

#icon {
  background-color: #09a6f3;
  color: #212529;
  font-size: x-large;
  font-family: "Cal Sans", sans-serif;
  padding: 8px;
  margin-left: 5%;
  border-radius: 4%;
}

main {
  display: flex;
  flex-grow: 1;
}
</style>
