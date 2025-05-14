// stores/useAuthStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null); // ⬅️ Direktinit

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    user.value = userData;
  };

  const logout = () => {
    localStorage.removeItem('user');
    user.value = null;
  };

  const isLoggedIn = computed(() => !!user.value?._id);
  const userId = computed(() => user.value?._id || null);

  return { user, login, logout, isLoggedIn, userId };
});
