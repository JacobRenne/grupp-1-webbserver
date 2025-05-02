const db = require('../db');

// Koppla genre till film
exports.addMovieGenre = (req, res) => {
    const { movieId, genreId } = req.body;
    db.query('INSERT INTO movieGenres (movieId, genreId) VALUES (?, ?)', [movieId, genreId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Genre kopplad till film' });
    });
};

// Koppla skådespelare till film
exports.addMovieActor = (req, res) => {
    const { movieId, actorId } = req.body;
    db.query('INSERT INTO movieActors (movieId, actorId) VALUES (?, ?)', [movieId, actorId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Skådespelare kopplad till film' });
    });
};

// Ta bort koppling mellan film och genre
exports.deleteMovieGenre = (req, res) => {
    const { movieId, genreId } = req.body;
    db.query('DELETE FROM movieGenres WHERE movieId = ? AND genreId = ?', [movieId, genreId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Relation not found' });
        res.json({ message: 'Genre disconnected from movie' });
    });
};

// Ta bort koppling mellan film och skådespelare
exports.deleteMovieActor = (req, res) => {
    const { movieId, actorId } = req.body;
    db.query('DELETE FROM movieActors WHERE movieId = ? AND actorId = ?', [movieId, actorId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Relation not found' });
        res.json({ message: 'Actor disconnected from movie' });
    });
};
