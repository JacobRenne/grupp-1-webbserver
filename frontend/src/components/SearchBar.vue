<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const query = ref('');
const results = ref([]);
const router = useRouter();
let timeout = null;

watch(query, async (newQuery) => {
  clearTimeout(timeout);

  if (!newQuery.trim()) {
    results.value = [];
    return;
  }

  timeout = setTimeout(async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/movies/search?q=${encodeURIComponent(newQuery)}`);
      const data = await res.json();
      results.value = data;
    } catch (err) {
      console.error('Search failed:', err);
      results.value = [];
    }
  }, 300); // debounce 300ms
});

const goToMovie = (id) => {
  query.value = '';
  results.value = [];
  router.push(`/movie/${id}`);
};
</script>

<template>
  <div class="search-wrapper">
    <input
      v-model="query"
      placeholder="Search movies..."
      class="search-input"
    />
    <ul v-if="results.length" class="search-results">
      <li v-for="movie in results" :key="movie.movieId" @click="goToMovie(movie.movieId)">
        {{ movie.title }} ({{ movie.releaseYear }})
      </li>
    </ul>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 1rem auto;
}

.search-input {
  font-size: 16px;
  padding: 10px 14px;
  width: 100%;
  border: 1px solid #555;
  border-radius: 6px;
  font-family: "Cal Sans", sans-serif;
  background-color: #1e1e1e;
  color: #eaeaea;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #8bc1db;
}

.search-results {
  list-style: none;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 220px;
  overflow-y: auto;
  color: #eaeaea;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.search-results li {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-results li:hover {
  background-color: #3a3a3a;
}
</style>

