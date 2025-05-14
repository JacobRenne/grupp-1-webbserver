const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

// Hämta recensioner för en viss användare
router.get('/user/:userId', verifyToken, reviewController.getReviewsByUserId);

// Hämta recensioner för en viss film (via path-param)
router.get('/movie/:movieId', reviewController.getReviewsByMovie);

// Hämta recensioner via query (?movieId=...)
router.get('/', reviewController.getReviewsByMovie); // Publikt

// Skapa en ny recension
router.post('/', verifyToken, reviewController.createReview);

// Hämta en specifik recension via ID
router.get('/:id', reviewController.getReviewById);

// Uppdatera recension
router.put('/:id', verifyToken, reviewController.updateReview);

// Radera recension
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
