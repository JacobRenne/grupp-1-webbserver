const express = require('express');
const router = express.Router();
const relationsController = require('../controllers/relationsController');

// Add genre to movie
router.post('/moviegenres', relationsController.addMovieGenre);

// Add actor to movie
router.post('/movieactors', relationsController.addMovieActor);

// Delete genre from movie (by movieId and genreId)
router.delete('/moviegenres/:movieId/:genreId', relationsController.deleteMovieGenre);

// Delete actor from movie (by movieId and actorId)
router.delete('/movieactors/:movieId/:actorId', relationsController.deleteMovieActor);

module.exports = router;
