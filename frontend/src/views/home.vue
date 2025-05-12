<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  getAllMovies,
  createMovie,
  deleteMovie,
  createActor,
  createDirector,
  createGenre,
  addMovieActor,
  addMovieGenre
} from '@/api/api';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const movies = ref([]);
const searchQuery = ref('');
const router = useRouter();

const newMovie = ref({
  title: '',
  year: '',
  image: null,
  directorName: '',
  directorBirthYear: '',
  actorName: '',
  actorBirthYear: '',
  genreName: '',
  description: ''
});

const selectedFileName = ref('Ingen fil är vald');
const currentYear = new Date().getFullYear();

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  selectedFileName.value = file ? file.name : 'Ingen fil är vald';
  newMovie.value.image = file;
};

const fetchAll = async () => {
  try {
    const res = await getAllMovies();

    movies.value = res.data.map((movie) => {
      const actors = typeof movie.actors === 'string' ? movie.actors.split(',') : movie.actors || [];
      const actorsBirthYear =
        typeof movie.actorsBirthYear === 'string'
          ? movie.actorsBirthYear.split(',').map((year) => year.trim())
          : Array.isArray(movie.actorsBirthYear)
          ? movie.actorsBirthYear
          : [];

      return {
        ...movie,
        actors,
        actorsBirthYear,
        genres: typeof movie.genres === 'string' ? movie.genres.split(',') : movie.genres || []
      };
    });
  } catch (err) {
    console.error('Could not fetch movies:', err);
  }
};

onMounted(fetchAll);

const addMovie = async () => {
  try {
    const title = newMovie.value.title.trim();
    const directorName = newMovie.value.directorName.trim();
    const actorName = newMovie.value.actorName.trim();
    const genreName = newMovie.value.genreName.trim();
    const description = newMovie.value.description.trim();
    const releaseYear = Number(newMovie.value.year?.trim());
    const directorYear = Number(newMovie.value.directorBirthYear?.trim());
    const actorYear = Number(newMovie.value.actorBirthYear?.trim());

    const alreadyExists = movies.value.some(
      (m) => m.title.toLowerCase() === title.toLowerCase() && m.releaseYear === releaseYear
    );
    if (alreadyExists) {
      alert('En film med samma titel och år finns redan.');
      return;
    }

    if (!title) {
      alert('Titel är obligatorisk');
      return;
    }
    if (isNaN(releaseYear) || releaseYear < 1900 || releaseYear > currentYear) {
      alert(`Utgivningsår måste vara ett nummer mellan 1900 och ${currentYear}`);
      return;
    }
    if (!directorName || isNaN(directorYear) || directorYear < 1900 || directorYear > currentYear) {
      alert(`Regissörens namn och födelseår krävs (1900–${currentYear})`);
      return;
    }
    if (!actorName || isNaN(actorYear) || actorYear < 1900 || actorYear > currentYear) {
      alert(`Skådespelarens namn och födelseår krävs (1900–${currentYear})`);
      return;
    }
    if (!genreName) {
      alert('Genre är obligatorisk');
      return;
    }

    const directorRes = await createDirector({ name: directorName, birthYear: directorYear });
    const actorRes = await createActor({ name: actorName, birthYear: actorYear });
    const genreRes = await createGenre({ name: genreName });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('releaseYear', releaseYear);
    formData.append('directorId', directorRes.data.id);
    formData.append('description', description);
    if (newMovie.value.image) {
      formData.append('image', newMovie.value.image);
    }

    const movieRes = await createMovie(formData);
    const movieId = movieRes.data.id;

    await addMovieActor({ movieId, actorId: actorRes.data.id });
    await addMovieGenre({ movieId, genreId: genreRes.data.id });

    newMovie.value = {
      title: '',
      year: '',
      image: null,
      directorName: '',
      directorBirthYear: '',
      actorName: '',
      actorBirthYear: '',
      genreName: '',
      description: ''
    };
    selectedFileName.value = 'Ingen fil är vald';

    await fetchAll();
  } catch (error) {
    console.error('Error creating movie with relations:', error);
    if (error.response?.status === 409) {
      alert('En film med samma titel och år finns redan.');
    } else {
      alert('Ett fel uppstod när filmen skulle sparas.');
    }
  }
};

const deleteMovieById = async (id) => {
  try {
    await deleteMovie(id);
    await fetchAll();
  } catch (err) {
    console.error('Could not delete movie:', err);
  }
};

const goToEditPage = (id) => {
  router.push(`/edit/${id}`);
};

const getImageUrl = (path) => {
  return path ? `http://localhost:3000${path}` : '';
};

const filteredMovies = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return movies.value.filter((movie) =>
    movie.title.toLowerCase().includes(q) ||
    movie.directorName?.toLowerCase().includes(q) ||
    movie.actors?.some((actor) => actor.toLowerCase().includes(q)) ||
    movie.genres?.some((genre) => genre.toLowerCase().includes(q))
  );
});

const genreChartData = computed(() => {
  const genreCounts = {};
  movies.value.forEach((movie) => {
    movie.genres?.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  return {
    labels: Object.keys(genreCounts),
    datasets: [
      {
        label: 'Movies per Genre',
        data: Object.values(genreCounts),
        backgroundColor: ['#4e937a', '#ff6384', '#36a2eb', '#ffcd56', '#9966ff']
      }
    ]
  };
});
</script>

<template>
  <div class="page-container">
    <h1>Create Movie</h1>

    <div class="top-section">
      <div class="form-area">
        <input v-model="newMovie.title" placeholder="Movie Title" />
        <input v-model="newMovie.year" placeholder="Release Year" />

        <h4>Director</h4>
        <input v-model="newMovie.directorName" placeholder="Director Name" />
        <input v-model="newMovie.directorBirthYear" placeholder="Birth Year" />

        <h4>Actor</h4>
        <input v-model="newMovie.actorName" placeholder="Actor Name" />
        <input v-model="newMovie.actorBirthYear" placeholder="Birth Year" />

        <h4>Genre</h4>
        <input v-model="newMovie.genreName" placeholder="Genre Name" />

        <h4>Description</h4>
        <textarea v-model="newMovie.description" placeholder="Description..." rows="3" />

        <h4>Image</h4>
        <label for="file-upload" class="custom-file-upload">
          Välj bild
        </label>
        <input id="file-upload" type="file" @change="handleFileUpload" />
        <p class="file-name">{{ selectedFileName }}</p>

        <button class="primary-btn" @click="addMovie">Create Movie</button>
      </div>

      <div class="chart-area">
        <Doughnut :data="genreChartData" />
      </div>
    </div>

    <hr />
    <h2>All Movies</h2>
    <input
      v-model="searchQuery"
      placeholder="Search by title, genre, director or actor..."
      class="search-bar"
    />

    <div class="movie-grid">
      <div class="movie-card" v-for="movie in filteredMovies" :key="movie.movieId">
        <img
          v-if="movie.imageUrl"
          :src="getImageUrl(movie.imageUrl)"
          alt="Movie Image"
          class="movie-image"
        />
        <h3>{{ movie.title }} ({{ movie.releaseYear }})</h3>
        <p><strong>Director:</strong> {{ movie.directorName }} ({{ movie.directorBirthYear || 'okänt' }})</p>
        <p><strong>Description:</strong> {{ movie.description }}</p>
        <p><strong>Genres:</strong> {{ movie.genres?.join(', ') }}</p>
        <p>
          <strong>Actors:</strong>
          <span v-if="movie.actors && movie.actors.length">
            <span v-for="(actor, index) in movie.actors" :key="index">
              {{ actor }} ({{ movie.actorsBirthYear?.[index] || 'okänt' }})<span v-if="index < movie.actors.length - 1">, </span>
            </span>
          </span>
          <span v-else>-</span>
        </p>
        <button @click="goToEditPage(movie.movieId)">Edit</button>
        <button @click="deleteMovieById(movie.movieId)">Delete</button>
      </div>
    </div>
  </div>
</template>

  


<style scoped>
/* === Container === */
.page-container {
  padding: 40px 20px;
  margin: 80px auto 40px;
  max-width: 1200px;
  box-sizing: border-box;
  background-color: #1e1e1e;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
}

/* === Top Layout === */
.top-section {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
  justify-content: space-between;
}

/* === Form and Chart === */
.form-area {
  flex: 1 1 500px;
}

.chart-area {
  flex: 1 1 400px;
  background-color: #2b2b2b;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* === Inputs === */
input,
textarea {
  display: block;
  margin: 12px 0;
  padding: 12px;
  width: 100%;
  font-size: 16px;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: #2d2d2d;
  color: #fff;
}

input[type="file"] {
  display: none;
}

/* === File Upload === */
.custom-file-upload {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4e937a;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.custom-file-upload:hover {
  background-color: #3e7b66;
}

.file-name {
  font-size: 14px;
  color: #aaa;
  margin-top: 6px;
}

/* === Buttons === */
button,
.primary-btn {
  padding: 10px 20px;
  background-color: #4e937a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  margin: 10px 10px 10px 0;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

button:hover,
.primary-btn:hover {
  background-color: #3b6e5f;
  transform: translateY(-1px);
}

/* === Search Bar === */
.search-bar {
  width: 100%;
  max-width: 500px;
  margin: 20px 0;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2d2d2d;
  color: #fff;
}

/* === Movie Cards === */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.movie-card {
  background-color: #2a2a2a;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  padding: 16px;
  text-align: center;
  transition: transform 0.2s ease;
}

.movie-card:hover {
  transform: translateY(-6px);
}

.movie-image {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 10px;
  object-fit: cover;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.movie-card:hover .movie-image {
  transform: scale(1.05);
  filter: brightness(1.15);
}

/* === Headings and Text === */
h1, h2, h3, h4 {
  margin-bottom: 10px;
  font-weight: 600;
  color: #ffffff;
}

h3 {
  font-size: 20px;
}

p {
  font-size: 14px;
  color: #ccc;
  margin: 4px 0;
  text-align: left;
}

/* === Responsive === */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
  }

  .form-area,
  .chart-area {
    width: 100%;
  }

  input,
  .primary-btn {
    width: 100%;
  }

  .movie-grid {
    grid-template-columns: 1fr;
  }

  h1, h2, h3, h4 {
    text-align: center;
  }
}
</style>

  
