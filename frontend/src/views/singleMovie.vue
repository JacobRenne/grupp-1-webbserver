<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { getMovieById } from '@/api/api';

const route = useRoute();
const movie = ref(null);
const comment = ref('');
const rating = ref(5);
const comments = ref([]);
const error = ref('');
const loading = ref(true);

// Auth info från localStorage
const user = ref(null);
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('user');
    }
  }
});

// computed user (för template)
const currentUser = computed(() => user.value);

// Trailer länkar
const trailers = computed(() => {
  if (!movie.value) return [];
  switch (movie.value.title) {
    case 'Inception': return ['https://www.youtube.com/embed/YoHD9XEInc0'];
    case 'The Dark Knight': return ['https://www.youtube.com/embed/EXeTwQWrcwY'];
    case 'Inglorious Basterds': return ['https://www.youtube.com/embed/KnrRy6kSFF0'];
    case 'Raiders of the Lost Ark': return ['https://www.youtube.com/embed/XkkzKHCx154'];
    case 'Goodfellas': return ['https://www.youtube.com/embed/2ilzidi_J8Q'];
    default: return [];
  }
});

// Medelbetyg
const averageRating = computed(() => {
  if (!comments.value.length) return null;
  const total = comments.value.reduce((sum, r) => sum + r.rating, 0);
  return (total / comments.value.length).toFixed(1);
});

const getImageUrl = (path) => {
  return path ? `http://localhost:3000${path}` : '';
};

// Kommentar för redigering
const editingCommentId = ref(null);
const editedComment = ref('');
const editedRating = ref(5);

// Ladda film och kommentarer
const loadMovieData = async (id) => {
  loading.value = true;
  error.value = '';
  try {
    const res = await getMovieById(id);
    movie.value = res.data;

    const reviewsRes = await axios.get(`http://localhost:3000/api/reviews/movie/${id}`);
    comments.value = reviewsRes.data;

    if (user.value?.token) {
      await axios.post(
        'http://localhost:3000/api/views',
        { movieId: id, userId: user.value._id },
        { headers: { Authorization: `Bearer ${user.value.token}` } }
      );
    }
  } catch (err) {
    error.value = 'Kunde inte hämta filmen eller recensioner.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Skapa kommentar
const submitComment = async () => {
  if (!user.value?.token) return alert('Du måste vara inloggad för att kommentera!');
  if (!comment.value.trim()) return;

  try {
    const payload = {
      movieId: route.params.id,
      reviewerId: user.value._id,
      reviewerName: user.value.profile?.firstName || user.value.username || 'Anonym',
      reviewerAvatar: user.value.profile?.avatar || '/uploads/avatars/default-avatar.png',
      rating: rating.value,
      comment: comment.value.trim()
    };

    await axios.post('http://localhost:3000/api/reviews', payload, {
      headers: { Authorization: `Bearer ${user.value.token}` }
    });

    comment.value = '';
    rating.value = 5;
    await loadMovieData(route.params.id);
  } catch (err) {
    console.error('Fel vid skickning av recension:', err);
    alert('Recensionen kunde inte sparas.');
  }
};

// Starta redigering
const startEditing = (c) => {
  editingCommentId.value = c._id;
  editedComment.value = c.comment;
  editedRating.value = c.rating;
};

// Avbryt redigering
const cancelEditing = () => {
  editingCommentId.value = null;
  editedComment.value = '';
};

// Uppdatera kommentar
const updateComment = async (id) => {
  try {
    await axios.put(
      `http://localhost:3000/api/reviews/${id}`,
      { comment: editedComment.value, rating: editedRating.value },
      { headers: { Authorization: `Bearer ${user.value.token}` } }
    );
    editingCommentId.value = null;
    editedComment.value = '';
    await loadMovieData(route.params.id);
  } catch (err) {
    console.error('Fel vid uppdatering:', err);
    alert('Kunde inte uppdatera kommentaren.');
  }
};

// Radera kommentar
const deleteComment = async (id) => {
  if (!confirm('Är du säker på att du vill radera kommentaren?')) return;
  try {
    await axios.delete(`http://localhost:3000/api/reviews/${id}`, {
      headers: { Authorization: `Bearer ${user.value.token}` }
    });
    await loadMovieData(route.params.id);
  } catch (err) {
    console.error('Fel vid radering:', err);
    alert('Kunde inte radera kommentaren.');
  }
};

// Ladda vid sidobyte
onMounted(() => loadMovieData(route.params.id));
watch(() => route.params.id, loadMovieData);
</script>




<template>
  <div class="container" v-if="movie">
    <div class="card">
      <img :src="getImageUrl(movie.imageUrl)" alt="Movie poster" class="poster" />
      <div class="details">
        <h1>{{ movie.title }} ({{ movie.releaseYear }})</h1>
        <p><strong>Director:</strong> {{ movie.directorName }} <span v-if="movie.directorBirthYear">({{ movie.directorBirthYear }})</span></p>
      
        <p><strong>Genres:</strong> {{ movie.genres?.join(', ') || 'N/A' }}</p>
        <p>
          <strong>Actors:</strong>
          <span v-if="movie.actors?.length">
            <span v-for="(actor, index) in movie.actors" :key="index">
              {{ actor }} ({{ movie.actorsBirthYear?.[index] || 'okänt' }})<span v-if="index < movie.actors.length - 1">, </span>
            </span>
          </span>
          <span v-else>N/A</span>
        </p>
        <p class="description"><strong>Description:</strong> {{ movie.description }}</p>

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
        <h3>Reviews</h3>
        <form @submit.prevent="submitComment" class="comment-form">
          <label>Rating:</label>
          <div class="stars">
            <span v-for="n in 5" :key="n" :class="{ filled: n <= rating }" @click="rating = n">★</span>
          </div>
          <textarea v-model="comment" placeholder="Write a comment..." rows="2"></textarea>
          <button type="submit">Submit</button>
        </form>

        <ul class="comment-list" v-if="comments.length">
  <li v-for="(c, index) in comments" :key="index" class="comment-item">
    <img v-if="c.reviewerAvatar" :src="getImageUrl(c.reviewerAvatar)" alt="avatar" class="avatar" />
    <div class="comment-content">
      <strong>{{ c.reviewerName }} ({{ c.rating }}/5):</strong>

      <div v-if="editingCommentId === c._id">
        <textarea v-model="editedComment" rows="2"></textarea>
        <div class="stars">
          <span v-for="n in 5" :key="n" :class="{ filled: n <= editedRating }" @click="editedRating = n">★</span>
        </div>
        <button @click="updateComment(c._id)">Spara</button>
        <button @click="cancelEditing">Avbryt</button>
      </div>
      <div v-else>
        <p>{{ c.comment }}</p>

        <div v-if="currentUser && currentUser._id === c.reviewerId" class="comment-actions">
          <button @click="startEditing(c)">Redigera</button>
          <button @click="deleteComment(c._id)">Radera</button>
        </div>
      </div>
    </div>
  </li>
</ul>

        <p v-else class="no-comments">No reviews yet.</p>
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
  background-color: #8bc1db;
}

.stars {
  display: flex;
  gap: 6px;
  cursor: pointer;
}
.stars span {
  font-size: 24px;
  color: #999;
}
.stars span.filled {
  color: gold;
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

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid var(--primary);
}
.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.comment-content {
  flex: 1;
}
.comment-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.comment-actions button {
  background-color: #444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.comment-actions button:hover {
  background-color: #666;
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
