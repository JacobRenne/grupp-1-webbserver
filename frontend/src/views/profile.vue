<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const user = ref(null);
const reviews = ref([]);

//hämta användare info
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

// se datum som kontot skapades
const formattedDate = computed(() =>
    user.value?.createdAt
        ? new Date(user.value.createdAt).toLocaleDateString()
        : ""
);

//hämta specifik users reviews
const fetchUserReviews = async () => {
    try {
        const userId = route.params.id;
        const res = await fetch(`http://localhost:3000/api/reviews/${userId}`);
        reviews.value = await res.json();
    } catch (err) {
        console.error("Failed to fetch user reviews", err);
    }
};

onMounted(fetchUser);
onMounted(fetchUserReviews);
</script>

<template>
    <div v-if="user" id="user-card">
        <h2>Welcome, {{ user.username }}!</h2>
        <div id="bio">
            <img
                v-if="user.profile?.avatar"
                :src="user.profile.avatar"
                alt="Avatar"
            />
            <span>
                <em>{{ user.profile?.bio || "No bio yet..." }}</em>
            </span>
        </div>
        <div id="user-info">
            <p>
                Name: {{ user.profile?.firstName }}
                {{ user.profile?.lastName }}
            </p>
            <p>Email: {{ user.email }}</p>
            <p>
                <small>Created: {{ formattedDate }}</small>
            </p>
        </div>
        <div id="user-reviews">
            <h3>Your reviews</h3>
        </div>
    </div>
    <p v-else>Loading profile...</p>
</template>

<style scoped>
#user-card {
    display: flex;
    flex-direction: column;
    align-items: center;
}
#user-info {
    width: 400px;
    padding: 20px;
    margin: 30px;
    background-color: whitesmoke;
}
#bio {
    flex-direction: row;
}

h3 {
    color: whitesmoke;
    font-size: large;
}
p {
    color: #000814;
    padding: 5px;
}

span {
    color: #8bc1db;
}

img {
    width: 100px;
}
</style>
