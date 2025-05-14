<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loggedInUser = JSON.parse(localStorage.getItem("user"));
const userId = loggedInUser?._id;

const user = ref(null);
const reviews = ref([]);
const bioInput = ref('');
const avatarInput = ref('');
const isEditing = ref(false);

const originalBio = ref('');
const originalAvatar = ref('');
const deleting = ref(false);

const avatarOptions = [
  '/uploads/avatars/avatar1.png',
  '/uploads/avatars/avatar2.png',
  '/uploads/avatars/avatar3.png',
  '/uploads/avatars/avatar4.png'
];

const fetchUser = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${loggedInUser?.token}`
      }
    });
    user.value = await res.json();
    bioInput.value = user.value?.profile?.bio || '';
    avatarInput.value = user.value?.profile?.avatar || '';
    originalBio.value = bioInput.value;
    originalAvatar.value = avatarInput.value;
  } catch (err) {
    console.error("Failed to fetch user", err);
  }
};

const fetchUserReviews = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/reviews/${userId}`);
    const data = await res.json();
    reviews.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch user reviews", err);
  }
};

const updateProfile = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loggedInUser?.token}`
      },
      body: JSON.stringify({
        profile: {
          ...user.value.profile,
          bio: bioInput.value,
          avatar: avatarInput.value
        }
      })
    });

    if (!res.ok) throw new Error("Failed to update profile");

    user.value = await res.json();
    isEditing.value = false;
    showToast("Profile updated successfully!", "success");
  } catch (err) {
    console.error("Error updating profile:", err);
    showToast("Could not update profile.", "error");
  }
};

const cancelEdit = () => {
  bioInput.value = originalBio.value;
  avatarInput.value = originalAvatar.value;
  isEditing.value = false;
};

const deleteAccount = async () => {
  const confirmDelete = confirm("Are you sure you want to delete your account?");
  if (!confirmDelete) return;

  try {
    deleting.value = true;
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${loggedInUser?.token}`
      }
    });

    if (!res.ok) throw new Error("Could not delete user");

    localStorage.removeItem("user");
    showToast("Account and reviews deleted successfully.", "success");
    router.push("/login");
  } catch (err) {
    console.error("Error deleting user:", err);
    showToast("Could not delete user.", "error");
  } finally {
    deleting.value = false;
  }
};

const showToast = (message, type = "info") => {
  if (window?.$toast) {
    window.$toast[type](message);
  } else {
    alert(message);
  }
};

const formattedDate = computed(() =>
  user.value?.createdAt ? new Date(user.value.createdAt).toLocaleDateString() : ""
);

onMounted(() => {
  if (userId) {
    fetchUser();
    fetchUserReviews();
  } else {
    showToast("You must be logged in to view your profile.", "error");
    router.push("/login");
  }
});
</script>

<template>
  <div v-if="user" id="user-card">
    <h2>Welcome, {{ user.username }}!</h2>

    <div class="profile-display">
      <img v-if="user.profile?.avatar" :src="user.profile.avatar" alt="Avatar" class="avatar" />
      <p><em>{{ user.profile?.bio || 'No bio yet...' }}</em></p>
    </div>

    <div class="info-box">
      <p><strong>Name:</strong> {{ user.profile?.firstName }} {{ user.profile?.lastName }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><small>Joined: {{ formattedDate }}</small></p>
    </div>

    <div class="edit-box">
      <h3>Edit Profile</h3>

      <div v-if="isEditing">
        <textarea v-model="bioInput" placeholder="New bio..."></textarea>

        <label>Select avatar:</label>
        <select v-model="avatarInput">
          <option disabled value="">-- Select avatar --</option>
          <option v-for="option in avatarOptions" :key="option" :value="option">
            {{ option.split('/').pop() }}
          </option>
        </select>

        <img v-if="avatarInput" :src="avatarInput" class="preview-avatar" />

        <div class="button-row">
          <button @click="updateProfile">💾 Save</button>
          <button class="cancel" @click="cancelEdit">✖ Cancel</button>
        </div>
      </div>

      <div v-else>
        <button @click="isEditing = true">✎ Edit</button>
      </div>
    </div>

    <div class="delete-box">
      <button class="delete" @click="deleteAccount" :disabled="deleting">
        🗑 Delete Account
      </button>
    </div>
  </div>

  <p v-else>Loading profile...</p>
</template>


<style scoped>
#user-card {
  background: #1f1f1f;
  padding: 2rem;
  max-width: 700px;
  margin: auto;
  border-radius: 12px;
  color: #eee;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
}

h2, h3 {
  color: #8bc1db;
  margin-bottom: 12px;
  text-align: center;
}

.profile-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #8bc1db;
  margin-bottom: 10px;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #8bc1db;
  margin: 10px 0;
}

textarea, select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  margin-top: 8px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #ddd;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

button {
  padding: 10px 20px;
  background: #8bc1db;
  color: black;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #73a9c7;
}

button.cancel {
  background-color: #ccc;
  color: #333;
}
button.cancel:hover {
  background-color: #aaa;
}

.delete-box {
  margin-top: 20px;
  text-align: center;
}

button.delete {
  background: #e05a5a;
  color: white;
}
button.delete:hover {
  background: #c44242;
}
</style>
