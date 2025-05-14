const View = require('../../MongoDB/Models/viewModel');

// Registrera visning
exports.registerView = async (req, res) => {
  const { movieId, userId } = req.body;
  if (!movieId || !userId) {
    return res.status(400).json({ message: 'Missing movieId or userId' });
  }

  const exists = await View.findOne({ movieId, userId });
  if (!exists) {
    await View.create({ movieId, userId });
  }

  res.json({ success: true });
};

//  Hämta visningsstatistik (grupperat per film)
exports.getViewsStats = async (req, res) => {
  try {
    const stats = await View.aggregate([
      { $group: { _id: '$movieId', views: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch view stats' });
  }
};
