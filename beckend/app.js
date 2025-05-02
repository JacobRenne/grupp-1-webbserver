const express = require('express');
const cors = require('cors');
const movieRoutes = require('./mysql/routes/movieRoutes');
const genreRoutes = require('./mysql/routes/genreRoutes');
const actorRoutes = require('./mysql/routes/actorRoutes');
const directorRoutes = require('./mysql/routes/directorRoutes');
const relationRoutes = require('./mysql/routes/relations');

const app = express();
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/movies', movieRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/directors', directorRoutes);
app.use('/api/relations', relationRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
