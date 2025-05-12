const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(cors());
app.use(fileUpload()); // Important: use fileUpload before express.json()
app.use(express.json());

// === Static file serving for uploaded images ===
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// === MySQL routes ===
const movieRoutes = require('./mysql/routes/movieRoutes');
const genreRoutes = require('./mysql/routes/genreRoutes');
const actorRoutes = require('./mysql/routes/actorRoutes');
const directorRoutes = require('./mysql/routes/directorRoutes');
const relationRoutes = require('./mysql/routes/relations');

app.use('/api/movies', movieRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/directors', directorRoutes);
app.use('/api/relations', relationRoutes);

// === MongoDB routes and connection ===
const reviewRoutes = require('./MongoDB/routes/reviewRoutes');
const userRoutes = require('./MongoDB/routes/userRoutes');
const connectionMongoDB = require('./MongoDB/connectionMongoDB');

// === Start the server when MongoDB is connected ===
connectionMongoDB()
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    app.use('/api/reviews', reviewRoutes);
    app.use('/api/users', userRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });
