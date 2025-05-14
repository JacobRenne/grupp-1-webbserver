const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  userId: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now }
});

// 🔐 Unik visning per användare/film
viewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

// 🔐 Förhindra "OverwriteModelError"
module.exports = mongoose.models.View || mongoose.model('View', viewSchema);
