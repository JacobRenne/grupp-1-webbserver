<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getMovieById } from '@/api/api';

const route = useRoute()
const movie = ref(null)

onMounted(async () => {
    try {
        const movieRes = await getMovieById(route.params.id)
        movie.value = movieRes.data
    } catch (error) {
        console.error(error)
    }
})
</script>

<template>
    <div class="movie-card" v-if="movie">
        <img src="" alt="Movie poster">
        <div class="info">
            <h1>{{ movie.title }} ({{ movie.releaseYear }})</h1>
            <p><strong>Director:</strong> {{ movie.directorName}}</p>
            <p><strong>Rating:</strong> {{ movie.rating }}</p>
            <p><strong>Views:</strong> {{ movie.views }}</p>
            <p><strong>Genres:</strong> {{ movie.genres.join(', ') }}</p>
        </div>
    </div>
</template>

<style scoped>


</style>