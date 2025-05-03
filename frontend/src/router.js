import { createRouter, createWebHashHistory } from 'vue-router'

import homeView from './views/home.vue'
import singleMovieView from './views/singleMovie.vue'
import profileView from './views/profile.vue'


export default createRouter({
	history: createWebHashHistory(),
	routes: [
		{ component: homeView, path: '/' },
		{ component: singleMovieView, path: '/movie/:id' },
		{ component: profileView, path: '/profile' }
	]
})