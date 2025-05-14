<script setup></script>

<template>
    <footer class="footer">
        <div class="footer-top">
       
        </div>
        <div class="footer-bottom">
          
            <p>&copy 2025 FMDb, inc.</p>
        </div>
    </footer>
</template>

<style scoped>
footer {
    background-color: #000814;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding-top: 2rem;
    padding-bottom: 1rem;
}

.footer-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    color: 8BC1DB;
}

.footer-top a {
    color: #8bc1db;
    transition: 0.3s;
    text-decoration: none;
}

.footer-top a:hover {
    background-color: #002b41;
    border-radius: 4px;
    padding: 2px 4px;
}

.footer-bottom {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

#icon {
    background-color: #09a6f3;
    color: #212529;
    font-size: 1.5rem;
    padding: 12px 12px;
    border-radius: 4px;
    text-decoration: none;
    text-align: center;
}
</style>
