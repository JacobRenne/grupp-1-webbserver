const Review = require('../../MongoDB/Models/reviewModel');
const mongoose = require('mongoose');

exports.createReview = async (req, res) => {
  try {
    // 1. Skapa ny recension
    const review = new Review(req.body);
    await review.save();

    // 2. Populera användarinformation (username + profile)
    await review.populate('reviewerId', 'username profile');

    // 3. Returnera formaterad data direkt
    res.status(201).json({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      reviewerName:
        review.reviewerId?.profile?.firstName ||
        review.reviewerId?.username ||
        'Anonym',
      reviewerAvatar:
        review.reviewerId?.profile?.avatar || '/uploads/avatars/default-avatar.png'
    });
  } catch (err) {
    console.error('Fel vid skapande av recension:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) {
      filter.movieId = req.query.movieId;
    }
    const reviews = await Review.find(filter);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    // 🛡️ Kontrollera att den inloggade användaren äger kommentaren
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }
    
    review.comment = req.body.comment;
    review.rating = req.body.rating;
    await review.save();
    
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    
    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reviews = await Review.find({ reviewerId: userId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hämta recensioner för en viss film (inkl. avatar och namn)
exports.getReviewsByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId || req.query.movieId;
    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required' });
    }

    const reviews = await Review.find({ movieId })
      .populate({
        path: 'reviewerId',
        select: 'username profile',
        model: 'User'
      });

      const formatted = reviews.map((review) => {
        const user = review.reviewerId;
        return {
          _id: review._id,
          rating: review.rating,
          comment: review.comment,
          reviewerId: user?._id, // ⬅️ detta saknades!
          reviewerName: user?.profile?.firstName || user?.username || 'Anonym',
          reviewerAvatar: user?.profile?.avatar || '/uploads/avatars/default-avatar.png'
        };
      });
      

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching movie reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


