const express = require('express');
const router = express.Router();
const directorController = require('../controllers/directorController');

// ROUTER

// Hämta alla regissörer
router.get('/', directorController.getAllDirectors);

// Hämta en regissör via ID
router.get('/:id', directorController.getDirectorById);

// Skapa en ny regissör
router.post('/', directorController.createDirector);

// Uppdatera en regissör
router.put('/:id', directorController.updateDirector);

// Ta bort en regissör
router.delete('/:id', directorController.deleteDirector);

// EXPORTERA ROUTERN
module.exports = router;
