<script setup>
import { ref, onMounted } from "vue";
import { getTopMovies } from "@/api/api";

const topMovies = ref([]);
const isLoading = ref(true);
const error = ref(null);

const getImageUrl = (path) => {
  return path ? `http://localhost:3000${path}` : '';
};

const getStarRating = (rating) => {
  const validRating = typeof rating === 'number' && rating >= 0 ? rating : 0;
  const fullStars = Math.floor(validRating);
  const hasHalfStar = validRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    '★'.repeat(fullStars) +
    (hasHalfStar ? '½' : '') +
    '☆'.repeat(Math.max(0, emptyStars))
  );
};

// Ladda filmer
onMounted(async () => {
  try {
    const res = await getTopMovies();
    topMovies.value = res.data;
  } catch (err) {
    error.value = err?.response?.data?.error || err.message || 'Kunde inte hämta topplistan';
  } finally {
    isLoading.value = false;
  }
});
</script>


<template>
  <div class="page-container">
    <h1>Top Movies</h1>
    <div class="movie-grid">
      <div class="movie-card" v-for="movie in topMovies" :key="movie.movieId">
        <router-link :to="`/movie/${movie.movieId}`">
          <div class="image-wrapper">
            <img
              v-if="movie.imageUrl"
              :src="getImageUrl(movie.imageUrl)"
              alt="Movie image"
              class="movie-image"
            />
            <div class="rating-badge">
              <span class="stars" v-text="getStarRating(movie.sqlRating)"></span>
              <span class="number">({{ movie.sqlRating.toFixed(1) }})</span>
            </div>
          </div>
          <h3>{{ movie.title }} ({{ movie.releaseYear }})</h3>
          <p><strong>Genres:</strong> {{ movie.genres.join(', ') }}</p>
          <p><strong>Director:</strong> 
            {{ movie.directorName }} 
            <span v-if="movie.directorBirthYear">({{ movie.directorBirthYear }})</span>
          </p>
          <p><strong>Actors:</strong>
            <span v-if="movie.actors.length">
              <span v-for="(actor, index) in movie.actors" :key="index">
                {{ actor }}
                <span v-if="movie.actorsBirthYear && movie.actorsBirthYear[index]">
                  ({{ movie.actorsBirthYear[index] }})
                </span>
                <span v-if="index < movie.actors.length - 1">, </span>
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
  text-decoration: none;
}

a {
  text-decoration: none;
}

.image-wrapper {
  position: relative;
  width: 100%;
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 215, 0, 0.95);
  color: #333;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.stars {
  font-size: 14px;
  color: #d97706;
}

.number {
  font-size: 13px;
  color: #333;
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
