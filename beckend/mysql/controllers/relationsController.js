const db = require('../db');

// Lägg till en genre till en film
exports.addMovieGenre = (req, res) => {
    const { movieId, genreId } = req.body;

    // Kontrollera om relationen redan finns
    db.query('SELECT * FROM movieGenres WHERE movieId = ? AND genreId = ?', [movieId, genreId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            // Relationen finns redan, behöver inte läggas till igen
            return res.status(400).json({ message: 'Genren är redan kopplad till filmen' });
        }

        // Lägg till genren i movieGenres-tabellen
        db.query('INSERT INTO movieGenres (movieId, genreId) VALUES (?, ?)', [movieId, genreId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Genren kopplades till filmen' });
        });
    });
};

// Lägg till en skådespelare till en film
exports.addMovieActor = (req, res) => {
    const { movieId, actorId } = req.body;

    // Kontrollera om relationen redan finns
    db.query('SELECT * FROM movieActors WHERE movieId = ? AND actorId = ?', [movieId, actorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            // Relationen finns redan, behöver inte läggas till igen
            return res.status(400).json({ message: 'Skådespelaren är redan kopplad till filmen' });
        }

        // Lägg till skådespelaren i movieActors-tabellen
        db.query('INSERT INTO movieActors (movieId, actorId) VALUES (?, ?)', [movieId, actorId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Skådespelaren kopplades till filmen' });
        });
    });
};

// Ta bort en genre från en film
exports.deleteMovieGenre = (req, res) => {
    const { movieId, genreId } = req.params;

    // Kontrollera om relationen finns
    db.query('SELECT * FROM movieGenres WHERE movieId = ? AND genreId = ?', [movieId, genreId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
            // Relationen hittades inte
            return res.status(404).json({ message: 'Relationen hittades inte' });
        }

        // Ta bort genren från filmen
        db.query('DELETE FROM movieGenres WHERE movieId = ? AND genreId = ?', [movieId, genreId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Genren togs bort från filmen' });
        });
    });
};

// Ta bort en skådespelare från en film
exports.deleteMovieActor = (req, res) => {
    const { movieId, actorId } = req.params;

    // Kontrollera om relationen finns
    db.query('SELECT * FROM movieActors WHERE movieId = ? AND actorId = ?', [movieId, actorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
            // Relationen hittades inte
            return res.status(404).json({ message: 'Relationen hittades inte' });
        }

        // Ta bort skådespelaren från filmen
        db.query('DELETE FROM movieActors WHERE movieId = ? AND actorId = ?', [movieId, actorId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Skådespelaren togs bort från filmen' });
        });
    });
};
