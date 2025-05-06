import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Justera URL vid behov

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Movies
export const getAllMovies = () => api.get('/movies');
export const getMovieById = (id) => api.get(`/movies/${id}`);
export const createMovie = (data) => api.post('/movies', data);
export const updateMovie = (id, data) => api.put(`/movies/${id}`, data);
export const deleteMovie = (id) => api.delete(`/movies/${id}`);

// Actors
export const getAllActors = () => api.get('/actors');
export const getActorById = (id) => api.get(`/actors/${id}`);
export const createActor = (data) => api.post('/actors', data);
export const updateActor = (id, data) => api.put(`/actors/${id}`, data);
export const deleteActor = (id) => api.delete(`/actors/${id}`);

// Directors
export const getAllDirectors = () => api.get('/directors');
export const getDirectorById = (id) => api.get(`/directors/${id}`);
export const createDirector = (data) => api.post('/directors', data);
export const updateDirector = (id, data) => api.put(`/directors/${id}`, data);
export const deleteDirector = (id) => api.delete(`/directors/${id}`);

// Genres
export const getAllGenres = () => api.get('/genres');
export const getGenreById = (id) => api.get(`/genres/${id}`);
export const createGenre = (data) => api.post('/genres', data);
export const updateGenre = (id, data) => api.put(`/genres/${id}`, data);
export const deleteGenre = (id) => api.delete(`/genres/${id}`);

// Relations
export const addMovieGenre = (data) => api.post('/relations/moviegenres', data);
export const deleteMovieGenre = (data) => api.delete('/relations/moviegenres', { data });

export const addMovieActor = (data) => api.post('/relations/movieactors', data);
export const deleteMovieActor = (data) => api.delete('/relations/movieactors', { data });