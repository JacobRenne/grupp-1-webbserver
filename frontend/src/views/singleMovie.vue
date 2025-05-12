<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getMovieById } from '@/api/api';
 
const route = useRoute();
const movie = ref(null);
 
onMounted(async () => {
  try {
    const res = await getMovieById(route.params.id);
    movie.value = res.data;
  } catch (err) {
    console.error('Failed to fetch movie:', err);
  }
});
 
const getImageUrl = (path) => {
  return path ? `http://localhost:3000${path}` : '';
};
 
const trailers = computed(() => {
  if (!movie.value) return [];
  switch (movie.value.title) {
    case 'Inception':
      return ['https://www.youtube.com/embed/YoHD9XEInc0'];
    case 'The Dark Knight':
      return ['https://www.youtube.com/embed/EXeTwQWrcwY'];
    case 'Inglorious Basterds':
      return ['https://www.youtube.com/embed/KnrRy6kSFF0'];
    case 'Raiders of the Lost Ark':
      return ['https://www.youtube.com/embed/XkkzKHCx154'];
    case 'Goodfellas':
      return ['https://www.youtube.com/embed/2ilzidi_J8Q'];
    default:
      return [];
  }
});
 
const comment = ref('');
const comments = ref([]);
 
const submitComment = () => {
  if (comment.value.trim()) {
    comments.value.push(comment.value.trim());
    comment.value = '';
  }
};
</script>
 
<template>
  <div class="container" v-if="movie">
    <div class="card">
      <img :src="getImageUrl(movie.imageUrl)" alt="Movie poster" class="poster" />
 
      <div class="details">
        <h1>{{ movie.title }} ({{ movie.releaseYear }})</h1>
        <p><strong>Director:</strong>  {{ movie.directorName }} <span v-if="movie.directorBirthYear">({{ movie.directorBirthYear }})</span></p>
        <p><strong>Rating:</strong> {{ movie.rating }}</p>
        <p><strong>Views:</strong> {{ movie.views }}</p>
        <p><strong>Genres:</strong> {{ movie.genres?.join(', ') || 'N/A' }}</p>
        <p>
          <strong>Actors: </strong>
          <span v-if="movie.actors && movie.actors.length">
            <span v-for="(actor, index) in movie.actors" :key="index">
              {{ actor }} ({{ movie.actorsBirthYear?.[index] || 'okänt' }})<span v-if="index < movie.actors.length - 1">, </span>
            </span>
          </span>
          <span v-else>N/A</span>
        </p>
        <p class="description"><strong>Description:</strong> {{ movie.description }}</p>
 
        <!-- Trailer direkt under info -->
        <div v-if="trailers.length" class="inline-trailer">
          <h2>Watch Trailer</h2>
          <div class="trailer-frame-wrapper">
            <iframe
              :src="trailers[0]"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
 
    <div class="feedback-section">
 
      <div class="comments">
        <h3>Comments</h3>
        <form @submit.prevent="submitComment" class="comment-form">
          <textarea v-model="comment" placeholder="Write a comment..." rows="2"></textarea>
          <button type="submit">Submit</button>
        </form>
 
        <ul class="comment-list" v-if="comments.length">
          <li v-for="(c, index) in comments" :key="index">{{ c }}</li>
        </ul>
        <p v-else class="no-comments">No comments yet.</p>
      </div>
    </div>
  </div>
</template>
 
<style scoped>
:root {
  --primary: #4e937a;
  --secondary: #2d2d2d;
  --bg: #1c1c1c;
  --text-light: #eaeaea;
  --text-muted: #999;
}
 
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg);
  color: var(--text-light);
  padding: 40px 16px;
  min-height: 100vh;
}
 
.card {
  display: flex;
  flex-direction: column;
  background-color: var(--secondary);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-width: 1100px;
  width: 100%;
  margin-bottom: 32px;
}
.card:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.poster {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  filter: brightness(1.1);
}
 
.details {
  padding: 32px;
}
 
.details h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: var(--primary);
}
 
.details p {
  margin: 10px 0;
  font-size: 16px;
  color: var(--text-light);
}
 
.description {
  margin-top: 20px;
  font-style: italic;
  color: var(--text-muted);
}
 
.inline-trailer {
  margin-top: 32px;
  text-align: center;
  border-top: 1px solid #444;
}
 
.inline-trailer h2 {
  color: var(--primary);
  font-size: 22px;
  margin-bottom: 12px;
}
 
.trailer-frame-wrapper {
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease;
}
 
.trailer-frame-wrapper iframe {
  width: 360px;
  height: 200px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}
 
.trailer-frame-wrapper:hover iframe {
  transform: scale(1.05);
}
 
.feedback-section {
  width: 100%;
  max-width: 800px;
  background-color: #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
 
.comments h3 {
  margin-bottom: 16px;
  color: var(--primary);
}
 
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
 
.comment-form textarea {
  background: #1f1f1f;
  color: #ddd;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  resize: vertical;
  font-size: 15px;
}
 
.comment-form button {
  align-self: flex-end;
  padding: 8px 20px;
  background-color: var(--primary);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}
 
.comment-form button:hover {
  background-color: #3b7e67;
}
 
.comment-list li {
  background-color: #1f1f1f;
  border-left: 4px solid var(--primary);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 15px;
  color: #ccc;
}
 
.no-comments {
  color: var(--text-muted);
  font-style: italic;
  text-align: center;
}
 
@media (min-width: 768px) {
  .card {
    flex-direction: row;
  }
 
  .poster {
    width: 40%;
    max-height: 100%;
  }
 
  .details {
    width: 60%;
  }
 
  .trailer-frame-wrapper iframe {
    width: 420px;
    height: 236px;
  }
}
</style>