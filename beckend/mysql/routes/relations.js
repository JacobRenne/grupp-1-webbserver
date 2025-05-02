const express = require('express');
const router = express.Router();
const relationsController = require('../controllers/relationsController');

router.post('/moviegenres', relationsController.addMovieGenre);
router.post('/movieactors', relationsController.addMovieActor);
router.delete('/moviegenres', relationsController.deleteMovieGenre);
router.delete('/movieactors', relationsController.deleteMovieActor);


module.exports = router;
