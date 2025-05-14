<script setup>
import HamburgerMenu from "./components/HamburgerMenu.vue";
import SearchBar from "./components/SearchBar.vue";
import Footer from "./components/footer.vue";
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
    <div class="layout-div">
        <header>
            <nav>
                <a id="icon" href="/">FMDb</a>
                <ul>
                    <li><HamburgerMenu /></li>
                    <li><SearchBar /></li>
                </ul>
            </nav>
        </header>

        <main>
            <router-view></router-view>
        </main>

        <Footer></Footer>
    </div>
</template>

<style>
html,
body {
    height: 100%;
    margin: 0;
    background-color: #212529;
    font-family: "Cal Sans", sans-serif;
}
</style>

<style scoped>
.layout-div {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw;
    color: whitesmoke;
}

header {
    background: #000814;
    width: 100%;
    height: 80px;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 5vw;
}

ul {
    display: flex;
    list-style-type: none;
    gap: 20px;
    margin: 0;
    padding: 0;
}

li {
    display: flex;
    align-items: center;
    font-weight: bold;
}

a {
    text-decoration: none;
    color: #8bc1db;
    background-color: #212529;
    transition: 0.2s;
    border-radius: 2px;
    margin: 5px;
    padding: 8px 10px;
}

a:hover {
    background-color: #000814;
}

#icon {
    background-color: #09a6f3;
    color: #212529;
    font-size: 1.5rem;
    padding: 8px 12px;
    border-radius: 4px;
    text-decoration: none;
}

main {
    flex: 1;
    padding: 2rem;
}
</style>
