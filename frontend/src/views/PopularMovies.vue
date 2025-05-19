<script setup>
import { ref, onMounted } from "vue";
import { getPopularMovies } from "@/api/api";

const popularMovies = ref([]);
const isLoading = ref(true);
const error = ref(null);

const getImageUrl = (path) => {
  return path ? `http://localhost:3000${path}` : "";
};

onMounted(async () => {
  try {
    const res = await getPopularMovies();

    popularMovies.value = res.data.map((movie) => {
      const actors = Array.isArray(movie.actors)
        ? movie.actors
        : typeof movie.actors === "string"
        ? movie.actors.split(",").map((a) => a.trim())
        : [];

      const actorsBirthYear = Array.isArray(movie.actorsBirthYear)
        ? movie.actorsBirthYear
        : typeof movie.actorsBirthYear === "string"
        ? movie.actorsBirthYear.split(",").map((year) => year.trim())
        : [];

      const genres = Array.isArray(movie.genres)
        ? movie.genres
        : typeof movie.genres === "string"
        ? movie.genres.split(",").map((g) => g.trim())
        : [];

      return {
        ...movie,
        actors,
        actorsBirthYear,
        genres,
      };
    });
    console.log(popularMovies.value)
  } catch (err) {
    error.value = err?.message || "Kunde inte hämta populära filmer";
  } finally {
    isLoading.value = false;
  }
});
</script>


<template>
  <div class="page-container">
    <h1>Popular Movies</h1>
    <div class="movie-grid">
      <div class="movie-card" v-for="movie in popularMovies" :key="movie.movieId">
        <router-link :to="`/movie/${movie.movieId}`">
          <div class="image-wrapper">
            <img
              v-if="movie.imageUrl"
              :src="getImageUrl(movie.imageUrl)"
              :alt="`Image of ${movie.title}`"
              class="movie-image"
              loading="lazy"
            />
            <div class="view-badge">{{ movie.sqlViews }} views</div>
          </div>

          <h3>{{ movie.title }} ({{ movie.releaseYear }})</h3>
          <p><strong>Genres:</strong> {{ movie.genres?.join(", ") || "N/A" }}</p>
          <p>
            <strong>Director:</strong>
            {{ movie.directorName }}
            <span v-if="movie.directorBirthYear">({{ movie.directorBirthYear }})</span>
          </p>
          <p>
            <strong>Actors:</strong>
            <span v-if="movie.actors && movie.actors.length">
              <span v-for="(actor, index) in movie.actors" :key="index">
                {{ actor }} ({{ movie.actorsBirthYear?.[index] || "okänt" }})<span
                  v-if="index < movie.actors.length - 1"
                  >, </span
                >
              </span>
            </span>
            <span v-else>N/A</span>
          </p>
          <p><strong>Description:</strong> {{ movie.description }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 100%;
  margin: 100px auto 40px;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1 {
  color: #ffffff;
  margin-bottom: 30px;
}

.movie-grid {
  width: 100%;
  max-width: 1400px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
}

.movie-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 16px;
  transition: transform 0.3s ease;
}

a {
  text-decoration: none;
}

.image-wrapper {
  position: relative;
  width: 100%;
}

.view-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
  z-index: 1;
}

.movie-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  margin-bottom: 12px;
  border-radius: 8px 8px 0 0;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.movie-card:hover .movie-image {
  transform: scale(1.05);
  filter: brightness(1.15);
}

h3 {
  margin: 10px 0 6px;
  font-size: 18px;
  color: #333;
}

p {
  margin: 4px 0;
  color: #555;
  font-size: 14px;
}

@media (max-width: 599px) {
  .page-container {
    padding: 0 16px;
  }

  .movie-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  h1, h3 {
    text-align: center;
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .movie-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1200px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}
</style>
