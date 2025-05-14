<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getAllMovies,
  updateMovie,
  createActor,
  createDirector,
  createGenre,
  addMovieActor,
  addMovieGenre,
  deleteMovieActor,
  deleteMovieGenre,
  getAllActors,
  getAllDirectors,
  getAllGenres
} from '@/api/api';

const route = useRoute();
const router = useRouter();
const movieId = Number(route.params.id);

const movie = ref(null);
const updatedMovie = ref({
  title: '',
  year: '',
  directorName: '',
  directorBirthYear: '',
  actorName: '',
  actorBirthYear: '',
  genreName: '',
  description: '',
  image: null
});

const selectedFileName = ref('No file selected');
const birthYearWarning = ref('');
const loading = ref(false);

const currentYear = new Date().getFullYear();

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  selectedFileName.value = file ? file.name : 'No file selected';
  updatedMovie.value.image = file;
};

const isValidYear = (value) => {
  const year = Number(value);
  return year >= 1900 && year <= currentYear;
};

const handleBirthYearInput = (field) => {
  const value = updatedMovie.value[field];
  if (value && !isValidYear(value)) {
    birthYearWarning.value = 'Birth year must be between 1900 and ' + currentYear;
  } else {
    birthYearWarning.value = '';
  }
};

const findOrCreateGenre = async (name) => {
  const all = await getAllGenres();
  const found = all.data.find(g => g.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  const res = await createGenre({ name });
  return res.data;
};

const findOrCreate = async (name, birthYear, getAllFn, createFn) => {
  const all = await getAllFn();
  const found = all.data.find(item => item.name.toLowerCase() === name.toLowerCase());
  if (found) return found;

  const validBirthYear = isValidYear(birthYear) ? birthYear : null;
  const res = await createFn({ name, birthYear: validBirthYear });
  return res.data;
};

// HÄR ligger din updatedMovie.value = {...} kod
const loadMovie = async () => {
  const all = await getAllMovies();
  const found = all.data.find(m => m.movieId === movieId);
  if (!found) return router.push('/');
  movie.value = found;

  updatedMovie.value = {
    title: found.title,
    year: found.releaseYear,
    directorName: found.directorName,
    directorBirthYear: found.directorBirthYear || '',
    actorName: found.actors[0] || '',
    actorBirthYear: found.actorsBirthYear?.[0] || '',
    genreName: found.genres[0] || '',
    description: found.description || '',
    image: null
  };
};

const saveMovie = async () => {
  if (!updatedMovie.value.title || !updatedMovie.value.year || !updatedMovie.value.directorName || !updatedMovie.value.actorName || !updatedMovie.value.genreName) {
    alert('All fields must be filled out.');
    return;
  }

  if (!isValidYear(updatedMovie.value.directorBirthYear) || !isValidYear(updatedMovie.value.actorBirthYear)) {
    alert('Please enter a valid birth year between 1900 and ' + currentYear);
    return;
  }

  const confirmed = confirm('Are you sure you want to save this movie?');
  if (!confirmed) return;

  loading.value = true;

  try {
    const director = await findOrCreate(
      updatedMovie.value.directorName,
      Number(updatedMovie.value.directorBirthYear),
      getAllDirectors,
      createDirector
    );

    const actor = await findOrCreate(
      updatedMovie.value.actorName,
      Number(updatedMovie.value.actorBirthYear),
      getAllActors,
      createActor
    );

    const genre = await findOrCreateGenre(updatedMovie.value.genreName);

    const formData = new FormData();
    formData.append('title', updatedMovie.value.title);
    formData.append('releaseYear', updatedMovie.value.year);
    formData.append('description', updatedMovie.value.description);
    formData.append('directorId', director.id);
    formData.append('directorBirthYear', director.birthYear); // 🟢 skickas till backend
    formData.append('actorId', actor.id);                     // 🟢
    formData.append('actorBirthYear', actor.birthYear);       // 🟢
    if (updatedMovie.value.image) {
      formData.append('image', updatedMovie.value.image);
    }

    const movieRes = await updateMovie(movieId, formData);
    if (movieRes.status !== 200) {
      console.error('Movie update failed');
      alert('Failed to update movie.');
      return;
    }

    router.push('/');
  } catch (error) {
    console.error('Error saving movie:', error);
    alert('Something went wrong while saving the movie.');
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
    router.push('/');
  }
};

onMounted(loadMovie);
</script>


<template>
  <div class="edit-container">
    <h1>Edit Movie</h1>
    <div class="form-area">
      <input v-model="updatedMovie.title" placeholder="Movie Title" />
      <input v-model="updatedMovie.year" placeholder="Release Year" />

      <h4>Director</h4>
      <input v-model="updatedMovie.directorName" placeholder="Director Name" />
      <input v-model="updatedMovie.directorBirthYear" placeholder="Birth Year" @input="handleBirthYearInput('directorBirthYear')" />

      <h4>Actor</h4>
      <input v-model="updatedMovie.actorName" placeholder="Actor Name" />
      <input v-model="updatedMovie.actorBirthYear" placeholder="Birth Year" @input="handleBirthYearInput('actorBirthYear')" />

      <h4>Genre</h4>
      <input v-model="updatedMovie.genreName" placeholder="Genre Name" />

      <h4>Description</h4>
      <textarea v-model="updatedMovie.description" rows="3" />

      <h4>Image</h4>
      <label for="file-upload" class="custom-file-upload">Choose Image</label>
      <input id="file-upload" type="file" @change="handleFileUpload" />
      <p class="file-name">{{ selectedFileName }}</p>

      <p v-if="birthYearWarning" class="warning-text">{{ birthYearWarning }}</p>

      <button v-if="!loading" class="primary-btn" @click="saveMovie">Save Movie</button>
      <button v-if="loading" class="primary-btn" disabled>Saving...</button>
      <button class="cancel-btn" @click="cancelEdit">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.edit-container {
  max-width: 800px;
  margin: 80px auto;
  background-color: #1e1e1e;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input,
textarea {
  padding: 12px;
  font-size: 16px;
  background-color: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  width: 100%;
}

input[type="file"] {
  display: none;
}

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
  margin-top: -6px;
  margin-bottom: 12px;
}

.warning-text {
  color: #f39c12;
  font-size: 14px;
  margin-bottom: 8px;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  background-color: #4e937a;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: #3b6e5f;
  transform: translateY(-1px);
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background-color: #a44;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #822;
  transform: translateY(-1px);
}

h1, h4 {
  margin: 10px 0 0;
  font-weight: 600;
}

textarea {
  resize: vertical;
}
</style>
