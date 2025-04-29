const db = require('../db');

// Get all actors
exports.getAllActors = (req, res) => {
    db.query('SELECT * FROM actors', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Get actor by id
exports.getActorById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM actors WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Actor not found' });
        res.json(results[0]);
    });
};

// Create a new actor
exports.createActor = (req, res) => {
    const { name, birthYear } = req.body;
    db.query('INSERT INTO actors (name, birthYear) VALUES (?, ?)', [name, birthYear], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Actor created', id: result.insertId });
    });
};

// Update actor
exports.updateActor = (req, res) => {
    const { id } = req.params;
    const { name, birthYear } = req.body;
    db.query('UPDATE actors SET name = ?, birthYear = ? WHERE id = ?', [name, birthYear, id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Actor not found' });
        res.json({ message: 'Actor updated' });
    });
};

// Delete actor
exports.deleteActor = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM actors WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Actor not found' });
        res.json({ message: 'Actor deleted' });
    });
};
