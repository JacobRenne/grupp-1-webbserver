const db = require('../db');

// Hämta alla regissörer
exports.getAllDirectors = (req, res) => {
    db.query('SELECT * FROM directors', (err, results) => {
        if (err) return res.status(500).json({ error: err }); // Vid databasfel
        res.json(results); // Returnera alla regissörer som JSON
    });
};

// Hämta en specifik regissör baserat på ID
exports.getDirectorById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM directors WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err }); // Vid databasfel
        if (results.length === 0) return res.status(404).json({ message: 'Regissör hittades inte' });
        res.json(results[0]); // Returnera regissören
    });
};

// Skapa en ny regissör
exports.createDirector = (req, res) => {
    const { name, birthYear } = req.body;
    db.query('INSERT INTO directors (name, birthYear) VALUES (?, ?)', [name, birthYear], (err, result) => {
        if (err) return res.status(500).json({ error: err }); // Vid databasfel
        res.status(201).json({ message: 'Regissör skapad', id: result.insertId }); // Returnera det nya ID:t
    });
};

// Uppdatera en befintlig regissör
exports.updateDirector = (req, res) => {
    const { id } = req.params;
    const { name, birthYear } = req.body;
    db.query('UPDATE directors SET name = ?, birthYear = ? WHERE id = ?', [name, birthYear, id], (err, result) => {
        if (err) return res.status(500).json({ error: err }); // Vid databasfel
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Regissör hittades inte' });
        res.json({ message: 'Regissör uppdaterad' });
    });
};

// Ta bort en regissör
exports.deleteDirector = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM directors WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err }); // Vid databasfel
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Regissör hittades inte' });
        res.json({ message: 'Regissör borttagen' });
    });
};
