const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// POST
router.post('/', reviewController.createReview);

// GET
router.get('/', reviewController.getAllReviews);

// GET  by id
router.get('/:id', reviewController.getReviewById);

// PUT
router.put('/:id', reviewController.updateReview);

// DELETE
router.delete('/:id', reviewController.deleteReview);

module.exports = router;