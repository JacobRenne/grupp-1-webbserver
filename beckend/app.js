const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

// Tillåt endast din frontend i utveckling
app.use(cors({
  origin: ['http://localhost:5173'], // Lägg till fler domäner om du har frontend live
  credentials: true
}));

app.use(express.json());

// Begränsa filstorlek och hantera filer säkrare
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5 MB
  abortOnLimit: true,
  responseOnLimit: 'Filen är för stor. Max 5MB tillåts.'
}));

// Gör alla uploads publikt tillgängliga (avatars, bilder, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// MySQL Routes (filmer etc.)
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

// MongoDB Routes (användare, recensioner, visningar)
const connectMongoDB = require('./MongoDB/connectionMongoDB');
const reviewRoutes = require('./MongoDB/routes/reviewRoutes');
const userRoutes = require('./MongoDB/routes/userRoutes');
const loginRoutes = require('./MongoDB/routes/loginRoutes');
const viewRoutes = require('./MongoDB/routes/viewRoutes');

// Anslut till MongoDB
connectMongoDB()
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/views', viewRoutes);

// 404 fallback för okända endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global felhantering
app.use((err, req, res, next) => {
  console.error('❗ Global error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Starta servern ===
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
