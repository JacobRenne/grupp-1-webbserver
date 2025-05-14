const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/viewsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Endast inloggade användare får registrera visningar
router.post('/', verifyToken, viewsController.registerView);

module.exports = router;
