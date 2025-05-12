const db = require('../db');

// Add genre to movie
exports.addMovieGenre = (req, res) => {
    const { movieId, genreId } = req.body;

    // Check if the relation already exists
    db.query('SELECT * FROM movieGenres WHERE movieId = ? AND genreId = ?', [movieId, genreId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            // Relation already exists, no need to add again
            return res.status(400).json({ message: 'Genre already linked to the movie' });
        }

        // Insert the genre into the movieGenres table
        db.query('INSERT INTO movieGenres (movieId, genreId) VALUES (?, ?)', [movieId, genreId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Genre linked to movie' });
        });
    });
};

// Add actor to movie
exports.addMovieActor = (req, res) => {
    const { movieId, actorId } = req.body;

    // Check if the relation already exists
    db.query('SELECT * FROM movieActors WHERE movieId = ? AND actorId = ?', [movieId, actorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            // Relation already exists, no need to add again
            return res.status(400).json({ message: 'Actor already linked to the movie' });
        }

        // Insert the actor into the movieActors table
        db.query('INSERT INTO movieActors (movieId, actorId) VALUES (?, ?)', [movieId, actorId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Actor linked to movie' });
        });
    });
};

// Ta bort genre från film
exports.deleteMovieGenre = (req, res) => {
    const { movieId, genreId } = req.params;
    db.query('SELECT * FROM movieGenres WHERE movieId = ? AND genreId = ?', [movieId, genreId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) {
            return res.status(404).json({ message: 'Relation not found' });
        }
        db.query('DELETE FROM movieGenres WHERE movieId = ? AND genreId = ?', [movieId, genreId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Genre disconnected from movie' });
        });
    });
};

// Ta bort skådespelare från film
exports.deleteMovieActor = (req, res) => {
    const { movieId, actorId } = req.params;
    db.query('SELECT * FROM movieActors WHERE movieId = ? AND actorId = ?', [movieId, actorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) {
            return res.status(404).json({ message: 'Relation not found' });
        }
        db.query('DELETE FROM movieActors WHERE movieId = ? AND actorId = ?', [movieId, actorId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Actor disconnected from movie' });
        });
    });
};

