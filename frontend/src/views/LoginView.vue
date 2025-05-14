<template>
    <div class="auth-container">
      <h2>Log In</h2>
      <form @submit.prevent="handleLogin" class="auth-form" autocomplete="off">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            v-model="formData.email"
            autocomplete="off"
            required
          />
        </div>
  
        <div class="form-group">
          <label for="password">Password:</label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="eye-btn"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>
  
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? 'Logging in...' : 'Log In' }}
        </button>
      </form>
  
      <p class="toggle-auth">
        Don't have an account?
        <router-link to="/signup">Sign up</router-link>
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/useAuthStore';
  
  const auth = useAuthStore();
  const router = useRouter();
  
  const isSubmitting = ref(false);
  const showPassword = ref(false);
  
  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };
  
  const formData = ref({
    email: '',
    password: ''
  });
  
  const handleLogin = async () => {
    isSubmitting.value = true;
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.value.email,
          password: formData.value.password
        })
      });
  
      if (!res.ok) throw new Error(await res.text());
  
      const data = await res.json();
      if (!data._id || !data.token) throw new Error('Invalid server response.');
  
      auth.login(data);
      router.push(`/user/${data._id}`);
    } catch (err) {
      console.error("Login error:", err);
      alert(err.message || 'Login failed.');
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  
  
  <style scoped>
  .auth-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }
  
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 600;
    color: #2c3e50;
  }
  
  input {
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .password-wrapper input {
    flex: 1;
    padding-right: 2.5rem;
  }
  
  .eye-btn {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #555;
    padding: 0.25rem;
  }
  
  .eye-btn:hover {
    color: #000;
  }
  
  .submit-btn {
    padding: 0.75rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: background-color 0.3s;
  }
  
  .submit-btn:hover {
    background-color: #2980b9;
  }
  
  .submit-btn:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
  
  .toggle-auth {
    text-align: center;
    margin-top: 1.5rem;
    color: #7f8c8d;
  }
  
  .toggle-auth a {
    color: #3498db;
    text-decoration: none;
  }
  
  .toggle-auth a:hover {
    text-decoration: underline;
  }
  </style>
  