const db = require('../db');

// Get all directors
exports.getAllDirectors = (req, res) => {
    db.query('SELECT * FROM directors', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Get director by id
exports.getDirectorById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM directors WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Director not found' });
        res.json(results[0]);
    });
};

// Create a new director
exports.createDirector = (req, res) => {
    const { name, birthYear } = req.body;
    db.query('INSERT INTO directors (name, birthYear) VALUES (?, ?)', [name, birthYear], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Director created', id: result.insertId });
    });
};

// Update director
exports.updateDirector = (req, res) => {
    const { id } = req.params;
    const { name, birthYear } = req.body;
    db.query('UPDATE directors SET name = ?, birthYear = ? WHERE id = ?', [name, birthYear, id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Director not found' });
        res.json({ message: 'Director updated' });
    });
};

// Delete director
exports.deleteDirector = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM directors WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Director not found' });
        res.json({ message: 'Director deleted' });
    });
};
