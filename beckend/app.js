const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload'); 
const app = express(); 

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // Nu är `app` redan definierad

// Statisk tillgång till uppladdade bilder
app.use('/uploads', express.static('public/uploads'));

// ROUTES (MySQL)
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

// MongoDB

const reviewRoutes = require('./MongoDB/routes/reviewRoutes');
const connectionMongoDB = require('./MongoDB/connectionMongoDB');
const userRoutes = require('./MongoDB/routes/userRoutes');

connectionMongoDB().then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
