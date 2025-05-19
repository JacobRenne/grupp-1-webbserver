const express = require('express');
const router = express.Router();
const relationsController = require('../controllers/relationsController');

// Lägg till en genre till en film
router.post('/moviegenres', relationsController.addMovieGenre);

// Lägg till en skådespelare till en film
router.post('/movieactors', relationsController.addMovieActor);

// Ta bort en genre från en film (via movieId och genreId)
router.delete('/moviegenres/:movieId/:genreId', relationsController.deleteMovieGenre);

// Ta bort en skådespelare från en film (via movieId och actorId)
router.delete('/movieactors/:movieId/:actorId', relationsController.deleteMovieActor);

module.exports = router;
