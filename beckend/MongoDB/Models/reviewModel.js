const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerName: { type: String, required: true },
  reviewerAvatar: { type: String, default: '/uploads/avatars/default-avatar.png' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 🔐 Förhindra "OverwriteModelError"
module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
