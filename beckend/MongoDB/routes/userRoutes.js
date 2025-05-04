const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST
router.post('/', userController.createUser);

// GET
router.get('/', userController.getAllUsers);

// GET by id
router.get('/:id', userController.getUserById);

// PUT
router.put('/:id', userController.updateUser);

// DELETE
router.delete('/:id', userController.deleteUser);

module.exports = router;