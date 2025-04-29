const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// ROUTER

// Hämta alla filmer
router.get('/', movieController.getAllMovies);

// Hämta en film via ID
router.get('/:id', movieController.getMovieById);

// Skapa en ny film
router.post('/', movieController.createMovie);

// Uppdatera en film
router.put('/:id', movieController.updateMovie);

// Ta bort en film
router.delete('/:id', movieController.deleteMovie);

// EXPORTERA ROUTERN
module.exports = router;
