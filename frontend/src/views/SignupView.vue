<template>
    <div class="auth-container">
      <h2>Create Account</h2>
      <form @submit.prevent="handleSignup" class="auth-form" autocomplete="off">
        <div class="form-group">
          <label>Username:</label>
          <input
            type="text"
            v-model="formData.username"
            required
            minlength="3"
            autocomplete="off"
          />
        </div>
  
        <div class="form-group">
          <label>Email:</label>
          <input
            type="email"
            v-model="formData.email"
            required
            autocomplete="off"
          />
        </div>
  
        <div class="form-group">
          <label>Password:</label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              required
              minlength="6"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="eye-btn"
              @click="togglePassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>
  
        <div class="form-group">
          <label>First Name:</label>
          <input type="text" v-model="formData.profile.firstName" />
        </div>
  
        <div class="form-group">
          <label>Last Name:</label>
          <input type="text" v-model="formData.profile.lastName" />
        </div>
  
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>
  
      <p class="toggle-auth">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/useAuthStore';
  
  const router = useRouter();
  const auth = useAuthStore();
  const isSubmitting = ref(false);
  const showPassword = ref(false);
  
  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };
  
  const formData = ref({
    username: '',
    email: '',
    password: '',
    profile: {
      firstName: '',
      lastName: '',
      bio: '',
      avatar: ''
    }
  });
  
  const handleSignup = async () => {
    isSubmitting.value = true;
    try {
      // Create user
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value)
      });
  
      if (!res.ok) throw new Error(await res.text());
  
      // Log in immediately after signup
      const loginRes = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.value.email,
          password: formData.value.password
        })
      });
  
      if (!loginRes.ok) throw new Error('Could not log in after registration.');
      const loginData = await loginRes.json();
  
      if (!loginData._id || !loginData.token) throw new Error('Invalid response from server.');
  
      auth.login(loginData); // Set auth state in Pinia
      router.push(`/user/${loginData._id}`);
    } catch (err) {
      console.error(err);
      alert('Signup or login failed.');
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
    border: 1px solid #ddd;
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
  