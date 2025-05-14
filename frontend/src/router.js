import { createRouter, createWebHistory } from 'vue-router';

import homeView from './views/home.vue';
import singleMovieView from './views/singleMovie.vue';
import profileView from './views/profile.vue';
import topMoviesView from './views/TopMovies.vue';
import popularMoviesView from './views/PopularMovies.vue';
import allMovies from './views/allMovies.vue';
import EditMovieView from './views/EditMovieView.vue';

// 🔹 NYA SEPARATA VIEWS
import LoginView from './views/LoginView.vue';
import SignupView from './views/SignupView.vue';

export default createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/', component: homeView },
    { path: '/movie', component: allMovies },
    { path: '/movie/:id', component: singleMovieView },
    { path: '/top-movies', component: topMoviesView },
    { path: '/popular-movies', component: popularMoviesView },
    { path: '/user/:id', component: profileView },
    { path: '/edit/:id', component: EditMovieView },

    // 🔹 Separata auth-vyer
    { path: '/login', component: LoginView },
    { path: '/signup', component: SignupView }
  ]
});
