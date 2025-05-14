const express = require('express');
const router = express.Router();
const path = require('path');
const userController = require('../controllers/userController');
const User = require('../Models/userModel');
const { verifyToken } = require('../middleware/authMiddleware'); // ✅ Importera JWT-middleware

// Skapa ny användare (ingen token krävs)
router.post('/', userController.createUser);

// Hämta alla användare (valfritt: skydda med token om det bara är adminfunktion)
router.get('/', verifyToken, userController.getAllUsers);

// Hämta specifik användare via ID (kräver token)
router.get('/:id', verifyToken, userController.getUserById);

// Uppdatera användare (kräver token)
router.put('/:id', verifyToken, userController.updateUser);

// Ta bort användare (kräver token)
router.delete('/:id', verifyToken, userController.deleteUser);

// Ladda upp avatar till en användare (kräver token)
router.post('/avatar/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ error: 'Ingen fil har laddats upp.' });
    }

    const file = req.files.avatar;
    const fileName = `${userId}-${Date.now()}-${file.name}`;
    const uploadPath = path.join(__dirname, '../../public/uploads/avatars/', fileName);

    await file.mv(uploadPath);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 'profile.avatar': `/uploads/avatars/${fileName}` },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'Användare ej hittad' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Fel vid uppladdning av avatar' });
  }
});

module.exports = router;
