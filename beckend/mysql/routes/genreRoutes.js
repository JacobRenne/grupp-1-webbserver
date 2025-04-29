const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

// ROUTER

// Hämta alla genrer
router.get('/', genreController.getAllGenres);

// Hämta en genre via ID
router.get('/:id', genreController.getGenreById);

// Skapa en ny genre
router.post('/', genreController.createGenre);

// Uppdatera en genre
router.put('/:id', genreController.updateGenre);

// Ta bort en genre
router.delete('/:id', genreController.deleteGenre);

// EXPORTERA ROUTERN
module.exports = router;
