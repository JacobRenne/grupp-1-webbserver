const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

// ROUTER

// Hämta alla skådespelare
router.get('/', actorController.getAllActors);

// Hämta en skådespelare via ID
router.get('/:id', actorController.getActorById);

// Skapa en ny skådespelare
router.post('/', actorController.createActor);

// Uppdatera en skådespelare
router.put('/:id', actorController.updateActor);

// Ta bort en skådespelare
router.delete('/:id', actorController.deleteActor);

// EXPORTERA ROUTERN
module.exports = router;
