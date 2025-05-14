<template>
  <div class="auth-container">
    <h2>{{ isLoginMode ? 'Log In' : 'Create Account' }}</h2>
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div v-if="!isLoginMode" class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          v-model="formData.username"
          required
          minlength="3"
          @input="validateField('username')"
        />
        <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          required
          @input="validateField('email')"
        />
        <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          required
          minlength="6"
          @input="validateField('password')"
        />
        <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
      </div>

      <div v-if="!isLoginMode" class="form-group">
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="formData.profile.firstName" />
      </div>

      <div v-if="!isLoginMode" class="form-group">
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="formData.profile.lastName" />
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button type="submit" :disabled="isSubmitting" class="submit-btn">
        {{ isSubmitting
          ? isLoginMode
            ? 'Logging In...'
            : 'Creating Account...'
          : isLoginMode
          ? 'Log In'
          : 'Create Account' }}
      </button>
    </form>

    <p class="toggle-auth">
      {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
      <a href="#" @click.prevent="toggleAuthMode">{{ isLoginMode ? 'Sign up' : 'Log in' }}</a>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();

const isLoginMode = ref(false);
const isSubmitting = ref(false);
const successMessage = ref('');

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

const errors = ref({
  username: '',
  email: '',
  password: ''
});

const validateField = (field) => {
  if (field === 'username' && formData.value.username.length < 3) {
    errors.value.username = 'Username must be at least 3 characters';
  } else if (field === 'email' && !/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email';
  } else if (field === 'password' && formData.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  } else {
    errors.value[field] = '';
  }
};

const resetForm = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    profile: { firstName: '', lastName: '', bio: '', avatar: '' }
  };
  errors.value = { username: '', email: '', password: '' };
};

const handleSubmit = async () => {
  if (isLoginMode.value) {
    await handleLogin();
  } else {
    await handleSignup();
  }
};

const handleLogin = async () => {
  validateField('email');
  validateField('password');

  if (Object.values(errors.value).some((e) => e)) return;
  isSubmitting.value = true;

  try {
    const response = await fetch(
      `http://localhost:3000/api/login?email=${encodeURIComponent(formData.value.email)}&password=${encodeURIComponent(formData.value.password)}`
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Login failed');
    }

    const userData = await response.json();
    localStorage.setItem('user', JSON.stringify(userData));

    successMessage.value = 'Login successful!';
    router.push(`/user/${userData._id}`); // ✅ Omdirigera till /user/:id
  } catch (error) {
    alert('Login failed. Please try again.');
    console.error('Login error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleSignup = async () => {
  validateField('username');
  validateField('email');
  validateField('password');

  if (Object.values(errors.value).some((e) => e)) return;
  isSubmitting.value = true;

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Signup failed');
    }

    successMessage.value = 'Account created successfully!';
    resetForm();
    isLoginMode.value = true;
  } catch (error) {
    alert('Signup failed. Please try again.');
    console.error('Signup error:', error);
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

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
}

.success-message {
  color: #27ae60;
  background-color: #e8f5e9;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  text-align: center;
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
