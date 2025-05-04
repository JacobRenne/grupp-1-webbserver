const express = require('express');
const cors = require('cors');
const movieRoutes = require('./mysql/routes/movieRoutes');
const genreRoutes = require('./mysql/routes/genreRoutes');
const actorRoutes = require('./mysql/routes/actorRoutes');
const directorRoutes = require('./mysql/routes/directorRoutes');
const relationRoutes = require('./mysql/routes/relations');



// MongoDB imports
const reviewRoutes = require('./MongoDB/routes/reviewRoutes');
const connectionMongoDB = require('./MongoDB/connectionMongoDB');
const userRoutes = require('./MongoDB/routes/userRoutes');


const app = express();
app.use(cors());
app.use(express.json());


// Initialize MongoDB connection
connectionMongoDB().then(() => {
    console.log('MongoDB connected successfully');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });



// Mount Routes
app.use('/api/movies', movieRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/directors', directorRoutes);
app.use('/api/relations', relationRoutes);


// MongoDB routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
