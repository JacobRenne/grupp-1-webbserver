<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const user = ref(null);

const fetchUser = async () => {
    try {
        const res = await fetch(
            `http://localhost:3000/api/users/${route.params.id}`
        );
        user.value = await res.json();
    } catch (err) {
        console.error("Failed to fetch user", err);
    }
};

onMounted(fetchUser);

const formattedDate = computed(() =>
    user.value?.createdAt
        ? new Date(user.value.createdAt).toLocaleDateString()
        : ""
);
</script>

<template>
    <!-- Koppla så deras användarnamn syns -->
    <div v-if="user">
        <h2>Welcome, {{ user.username }}!</h2>
        <img
            v-if="user.profile?.avatar"
            :src="user.profile.avatar"
            alt="Avatar"
        />
        <p>
            <strong>Name:</strong> {{ user.profile?.firstName }}
            {{ user.profile?.lastName }}
        </p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Bio:</strong> {{ user.profile?.bio || "No bio yet..." }}</p>
        <p>
            <small>Created: {{ formattedDate }}</small>
        </p>
    </div>
    <p v-else>Loading profile...</p>
</template>

<style scoped>
p {
    background-color: black;
    color: whitesmoke;
}

img {
    width: 100px;
}
</style>
