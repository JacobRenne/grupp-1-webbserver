<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  getAllMovies,
  createMovie,
  updateMovie,
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
const editingMovie = ref(null);
const searchQuery = ref('');

const newMovie = ref({
  title: '',
  year: '',
  image: null,
  directorName: '',
  directorBirthYear: '',
  actorName: '',
  actorBirthYear: '',
  genreName: ''
});

const updatedMovie = ref({ title: '', year: '', image: null });

const fetchAll = async () => {
  try {
    const res = await getAllMovies();
    movies.value = res.data;
  } catch (err) {
    console.error('Could not fetch movies:', err);
  }
};

onMounted(fetchAll);

const selectedFileName = ref('Ingen fil är vald');


const handleFileUpload = (e, mode) => {
  const file = e.target.files[0];
  if (file) selectedFileName.value = file.name;
  else selectedFileName.value = 'Ingen fil är vald';

  if (mode === 'new') newMovie.value.image = file;
  else updatedMovie.value.image = file;
};


const addMovie = async () => {
  try {
    const directorRes = await createDirector({
      name: newMovie.value.directorName,
      birthYear: Number(newMovie.value.directorBirthYear)
    });
    const actorRes = await createActor({
      name: newMovie.value.actorName,
      birthYear: Number(newMovie.value.actorBirthYear)
    });
    const genreRes = await createGenre({ name: newMovie.value.genreName });

    const formData = new FormData();
    formData.append('title', newMovie.value.title);
    formData.append('releaseYear', newMovie.value.year);
    formData.append('directorId', directorRes.data.id);
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
      genreName: ''
    };

    fetchAll();
  } catch (error) {
    console.error('Error creating movie with relations:', error);
  }
};

const startEditMovie = (movie) => {
  editingMovie.value = movie.movieId;
  updatedMovie.value = {
    title: movie.title,
    year: movie.releaseYear,
    image: null,
    directorId: movie.directorId
  };
};


const saveEditMovie = async (id) => {
  try {
    const formData = new FormData();
    formData.append('title', updatedMovie.value.title);
    formData.append('releaseYear', updatedMovie.value.year);
    formData.append('directorId', updatedMovie.value.directorId);

    if (updatedMovie.value.image) {
      formData.append('image', updatedMovie.value.image);
    }

    await updateMovie(id, formData);
    editingMovie.value = null;
    fetchAll();
  } catch (err) {
    console.error('Could not update movie:', err);
  }
};


const deleteMovieById = async (id) => {
  try {
    await deleteMovie(id);
    fetchAll();
  } catch (err) {
    console.error('Could not delete movie:', err);
  }
};

const getImageUrl = (path) => {
  return path ? `http://localhost:3000${path}` : '';
};

const filteredMovies = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return movies.value.filter(movie => {
    return (
      movie.title.toLowerCase().includes(q) ||
      movie.directorName?.toLowerCase().includes(q) ||
      movie.actors?.some(actor => actor.toLowerCase().includes(q)) ||
      movie.genres?.some(genre => genre.toLowerCase().includes(q))
    );
  });
});

const genreChartData = computed(() => {
  const genreCounts = {};
  movies.value.forEach(movie => {
    movie.genres?.forEach(genre => {
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
  
          <h4>Image</h4>
          <label for="file-upload" class="custom-file-upload">
            Välj bild
          </label>
          <input
            id="file-upload"
            type="file"
            @change="e => handleFileUpload(e, 'new')"
          />
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
          <div v-if="editingMovie === movie.movieId">
            <input v-model="updatedMovie.title" />
            <input v-model="updatedMovie.year" />
            <input type="file" @change="e => handleFileUpload(e, 'edit')" />
            <button @click="saveEditMovie(movie.movieId)">Save</button>
            <button @click="editingMovie = null">Cancel</button>
          </div>
          <div v-else>
            <img
              v-if="movie.imageUrl"
              :src="getImageUrl(movie.imageUrl)"
              alt="Movie Image"
              class="movie-image"
            />
            <h3>{{ movie.title }} ({{ movie.releaseYear }})</h3>
            <p><strong>Director:</strong> {{ movie.directorName }}</p>
            <p><strong>Genres:</strong> {{ movie.genres?.join(', ') }}</p>
            <p><strong>Actors:</strong> {{ movie.actors?.join(', ') }}</p>
            <button @click="startEditMovie(movie)">Edit</button>
            <button @click="deleteMovieById(movie.movieId)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  


  <style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 20px;
    margin: 80px auto 40px;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .top-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  
  .form-area {
    flex: 1 1 500px;
  }
  
  .chart-area {
    flex: 1 1 400px;
    max-width: 400px;
    min-height: 300px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .chart-area canvas {
    width: 100% !important;
    height: auto !important;
  }
  
  input {
    display: block;
    margin: 10px 0;
    padding: 10px;
    width: 50%;
    box-sizing: border-box;
    font-size: 16px;
  }

  input[type="file"] {
  display: none; 
}

.custom-file-upload {
  display: inline-block;
  padding: 10px 16px;
  background-color: #4e937a;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.custom-file-upload:hover {
  background-color: #3e7b66;
}

.file-name {
  font-size: 14px;
  color: #aaa;
  margin: 4px 0 10px;
}


  .search-bar {
    margin: 10px 0;
    padding: 10px;
    width: 100%;
    max-width: 500px;
    font-size: 16px;
    box-sizing: border-box;
  }
  
  button {
    margin: 10px 6px 10px 0;
    padding: 10px 16px;
    cursor: pointer;
    border: none;
    background-color: #4e937a;
    color: white;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #3e7b66;
  }
  
  .primary-btn {
    width: 200px;
    padding: 10px 20px;
    background-color: #4e937a;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .primary-btn:hover {
    background-color: #3b6e5f;
    transform: scale(1.03);
  }
  
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-top: 30px;
    width: 100%;
    max-width: 1400px;
    justify-content: center;
  }
  
  .movie-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px;
    transition: transform 0.2s ease;
  }
  
  .movie-card:hover {
    transform: translateY(-4px);
  }
  
  .movie-image {
    max-width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
    margin-bottom: 10px;
    transition: transform 0.3s ease, filter 0.3s ease;
  }
  
  .movie-card:hover .movie-image {
    transform: scale(1.05);
    filter: brightness(1.15);
  }
  
  h1, h2, h4 {
    margin-top: 20px;
    margin-bottom: 10px;
    color: #ffffff;
    text-align: left;
  }
  
  h3 {
    margin: 10px 0 6px;
    font-size: 18px;
    color: #333;
    text-align: left;
  }
  
  p {
    text-align: left;
    margin: 4px 0;
    color: #555;
    font-size: 14px;
  }
  
  @media (max-width: 599px) {
    .top-section {
      flex-direction: column;
      gap: 30px;
    }
  
    .form-area {
      order: 1;
      width: 100%;
    }
  
    .chart-area {
      order: 2;
      width: 100%;
      max-width: 100%;
      min-height: 300px;
    }
  
    input {
      width: 100%;
    }
  
    .primary-btn {
      width: 100%;
    }
  
    .movie-grid {
      grid-template-columns: 1fr;
    }
  
    h1, h2, h3, h4 {
      text-align: center;
    }
  
    .search-bar {
      width: 100%;
    }
  }
  
  @media (min-width: 600px) and (max-width: 899px) {
    .top-section {
      flex-direction: column;
      gap: 30px;
    }
  
    .form-area, .chart-area {
      width: 100%;
    }
  
    input {
      width: 80%;
    }
  
    .primary-btn {
      width: 80%;
    }
  }
  
  @media (min-width: 900px) and (max-width: 1199px) {
    .top-section {
      flex-direction: row;
    }
  
    .form-area {
      flex: 1 1 55%;
    }
  
    .chart-area {
      flex: 1 1 40%;
    }
  
    input {
      width: 70%;
    }
  
    .primary-btn {
      width: 60%;
    }
  }
  
 
  @media (min-width: 1200px) {
    .form-area input {
      width: 60%;
    }
  
    .primary-btn {
      width: 200px;
    }
  
    .movie-grid {
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
  }
  </style>
  
