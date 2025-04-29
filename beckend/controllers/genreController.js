const db = require('../db');

// Get all genres
exports.getAllGenres = (req, res) => {
    db.query('SELECT * FROM genres', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Get genre by id
exports.getGenreById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM genres WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Genre not found' });
        res.json(results[0]);
    });
};

// Create a new genre
exports.createGenre = (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO genres (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Genre created', id: result.insertId });
    });
};

// Update genre
exports.updateGenre = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    db.query('UPDATE genres SET name = ? WHERE id = ?', [name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Genre not found' });
        res.json({ message: 'Genre updated' });
    });
};

// Delete genre
exports.deleteGenre = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM genres WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Genre not found' });
        res.json({ message: 'Genre deleted' });
    });
};
