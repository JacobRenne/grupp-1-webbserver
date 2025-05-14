<script setup>
import { ref, onMounted } from "vue";
import { getAllMovies } from "@/api/api";

const movies = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Funktion för att normalisera array eller string
const normalizeArray = (input) => {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") return input.split(",").map((v) => v.trim());
  return [];
};

// Sökväg till bild
const getImageUrl = (path) => {
  return path ? `http://localhost:3000${path}` : "";
};

// 🔁 Hämta alla filmer
const fetchMovies = async () => {
  isLoading.value = true;
  try {
    const response = await getAllMovies();
    movies.value = response.data.map((movie) => ({
      ...movie,
      genres: normalizeArray(movie.genres),
      actors: normalizeArray(movie.actors),
      actorsBirthYear: normalizeArray(movie.actorsBirthYear)
    }));
  } catch (err) {
    error.value = err?.response?.data?.error || err.message || "Något gick fel vid hämtning av filmer";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchMovies);
</script>


<template>
    <div class="movies-container">
        <h1>All Movies</h1>

        <div v-if="isLoading" class="loading">Loading movies...</div>
        <div v-if="error" class="error">Error: {{ error }}</div>

        <ul v-if="!isLoading && movies.length" class="movie-list">
            <li v-for="movie in movies" :key="movie.movieId" class="movie-card">
                <RouterLink :to="{ path: `/movie/${movie.movieId}` }">
                    <img
                        v-if="movie.imageUrl"
                        :src="getImageUrl(movie.imageUrl)"
                        :alt="movie.title"
                        class="movie-poster"
                    />
                    <div class="movie-info">
                        <ul>
                            <li>
                                <h2>
                                    {{ movie.title }} ,
                                    <em>{{ movie.releaseYear }}</em>
                                </h2>
                            </li>
                            <li>Director: {{ movie.directorName }}</li>
                            <span v-if="movie.directorBirthYear"
                                >({{ movie.directorBirthYear }})</span
                            >
                            <li>
                                Genres: {{ movie.genres.join(", ") || "N/A" }}
                            </li>
                            <li>
                                Actors:
                                <span
                                    v-if="movie.actors && movie.actors.length"
                                >
                                    <span
                                        v-for="(actor, index) in movie.actors"
                                        :key="index"
                                    >
                                        {{ actor }} ({{
                                            movie.actorsBirthYear?.[index] ||
                                            "okänt"
                                        }})<span
                                            v-if="
                                                index < movie.actors.length - 1
                                            "
                                            >,
                                        </span>
                                    </span>
                                </span>
                                <span v-else>N/A</span>
                            </li>
                        </ul>
                    </div>
                </RouterLink>
            </li>
        </ul>

        <div v-else-if="!isLoading">No movies available.</div>
    </div>
</template>

<style scoped>
h1 {
    color: #f9f9f9;
    font-size: xx-large;
    font-family: "Cal Sans", sans-serif;
}

ul {
    list-style: none;
}

a {
    text-decoration: none;
    color: #555;
    width: 100%;
    padding: 12px;
}
.movies-container {
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    font-family: "Work Sans", sans-serif;
}

.loading,
.error {
    font-size: 1.2rem;
    margin: 20px 0;
    color: #555;
}

.error {
    color: red;
}

.movie-list {
    max-width: 1000px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    list-style: none;
}

.movie-card {
    display: flex;
    flex-direction: row;
    width: 250px;
    gap: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 5px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.movie-poster {
    width: 100%;
    height: auto;
    border-radius: 4px;
    object-fit: cover;
}

.movie-info {
    flex: 1;
    font-size: small;
    line-height: 1.6;
}

h2 {
    font-size: large;
}

.movie-info > ul {
    padding: 0;
}
</style>
