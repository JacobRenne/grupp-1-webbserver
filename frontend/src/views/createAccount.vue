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
          >
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
          >
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
          >
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>
  
        <div v-if="!isLoginMode" class="form-group">
          <label for="firstName">First Name:</label>
          <input 
            type="text" 
            id="firstName" 
            v-model="formData.profile.firstName"
          >
        </div>
  
        <div v-if="!isLoginMode" class="form-group">
          <label for="lastName">Last Name:</label>
          <input 
            type="text" 
            id="lastName" 
            v-model="formData.profile.lastName"
          >
        </div>
  
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
  
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? (isLoginMode ? 'Logging In...' : 'Creating Account...') : (isLoginMode ? 'Log In' : 'Create Account') }}
        </button>
      </form>
  
      <p class="toggle-auth">
        {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
        <a href="#" @click.prevent="toggleAuthMode">{{ isLoginMode ? 'Sign up' : 'Log in' }}</a>
      </p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isLoginMode: false,
        formData: {
          username: '',
          email: '',
          password: '',
          profile: {
            firstName: '',
            lastName: '',
            bio: '',
            avatar: ''
          }
        },
        errors: {
          username: '',
          email: '',
          password: ''
        },
        isSubmitting: false,
        successMessage: ''
      }
    },
    methods: {
      toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        this.resetForm();
      },
      validateField(field) {
        if (field === 'username' && this.formData.username.length < 3) {
          this.errors.username = 'Username must be at least 3 characters';
        } else if (field === 'email' && !/^\S+@\S+\.\S+$/.test(this.formData.email)) {
          this.errors.email = 'Please enter a valid email';
        } else if (field === 'password' && this.formData.password.length < 6) {
          this.errors.password = 'Password must be at least 6 characters';
        } else {
          this.errors[field] = '';
        }
      },
      async handleSubmit() {
        if (this.isLoginMode) {
          await this.handleLogin();
        } else {
          await this.handleSignup();
        }
      },
      async handleLogin() {
        this.validateField('email');
        this.validateField('password');
  
        if (Object.values(this.errors).some(error => error !== '')) {
          return;
        }
  
        this.isSubmitting = true;
  
        try {
          const response = await fetch(`http://localhost:3000/api/login?email=${this.formData.email}&password=${this.formData.password}`);
          
          if (!response.ok) {
            throw new Error('Login failed');
          }
  
          const userData = await response.json();
          
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userProfile', JSON.stringify(userData.profile));

          


          console.group('[AUTH] Login Success');
          console.log('Saved to localStorage:');
          console.table({
          'userEmail': localStorage.getItem('userEmail'),
          'userProfile': JSON.parse(localStorage.getItem('userProfile'))
        });



          
          this.successMessage = 'Login successful!';
         // this.$router.push('/');
        } catch (error) {
          console.error('Error:', error);
          alert('Login failed. Please try again.');
        } finally {
          this.isSubmitting = false;
        }
      },
      async handleSignup() {
        this.validateField('username');
        this.validateField('email');
        this.validateField('password');
  
        if (Object.values(this.errors).some(error => error !== '')) {
          return;
        }
  
        this.isSubmitting = true;
        this.successMessage = '';
  
        try {
          const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.formData)
          });
  
          if (!response.ok) {
            throw new Error('Account creation failed');
          }
  
          const data = await response.json();
          this.successMessage = 'Account created successfully!';
          this.resetForm();
          this.isLoginMode = true;
        } catch (error) {
          console.error('Error:', error);
          alert('Account creation failed. Please try again.');
        } finally {
          this.isSubmitting = false;
        }
      },
      resetForm() {
        this.formData = {
          username: '',
          email: '',
          password: '',
          profile: {
            firstName: '',
            lastName: '',
            bio: '',
            avatar: ''
          }
        };
        this.errors = {
          username: '',
          email: '',
          password: ''
        };
      }
    }
  }
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