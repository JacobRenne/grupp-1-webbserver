import { createRouter, createWebHistory } from 'vue-router';

import homeView from './views/home.vue';
import singleMovieView from './views/singleMovie.vue';
import profileView from './views/profile.vue';
import topMoviesView from './views/TopMovies.vue';
import popularMoviesView from './views/PopularMovies.vue';
import allMovies from './views/allMovies.vue';


export default createRouter({
  history: createWebHistory('/'),
  routes: [
    { component: homeView, path: '/' },
    { component: singleMovieView, path: '/movie/:id' },
    { component: profileView, path: '/profile' },
    { component: topMoviesView, path: '/top-movies' },
    { component: popularMoviesView, path: '/popular-movies' },
    { component: allMovies, path: '/movie'}
  ]
});
