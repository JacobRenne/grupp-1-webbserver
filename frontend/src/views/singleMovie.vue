<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const movie = ref(null)

onMounted(async () => {
    const id = route.params.id

    try {
        const res = await fetch(`http://localhost:3000/api/movies/${id}`)
        movie.value = await res.json()
        console.log(movie.value)
    } catch (error) { console.error(error)}
})


</script>

<template>
    <div v-if="movie">
        <h1>{{  movie.title }}</h1>
        <p>{{ movie.releaseYear }}</p>
    </div>
</template>

<style scoped>


</style>