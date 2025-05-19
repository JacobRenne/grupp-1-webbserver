const db = require('../db');

// Hämta alla skådespelare
exports.getAllActors = (req, res) => {
    db.query('SELECT * FROM actors', (err, results) => {
        if (err) return res.status(500).json({ error: err }); // Vid fel i databasförfrågan
        res.json(results); // Returnera alla skådespelare som JSON
    });
};

// Hämta en specifik skådespelare baserat på ID
exports.getActorById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM actors WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err }); // Vid fel
        if (results.length === 0) return res.status(404).json({ message: 'Skådespelare hittades inte' });
        res.json(results[0]); // Returnera skådespelaren
    });
};

// Skapa en ny skådespelare
exports.createActor = (req, res) => {
    const { name, birthYear } = req.body;
    db.query('INSERT INTO actors (name, birthYear) VALUES (?, ?)', [name, birthYear], (err, result) => {
        if (err) return res.status(500).json({ error: err }); // Fel vid insättning
        res.status(201).json({ message: 'Skådespelare skapad', id: result.insertId }); // Returnera det nya ID:t
    });
};

// Uppdatera en befintlig skådespelare
exports.updateActor = (req, res) => {
    const { id } = req.params;
    const { name, birthYear } = req.body;
    db.query('UPDATE actors SET name = ?, birthYear = ? WHERE id = ?', [name, birthYear, id], (err, result) => {
        if (err) return res.status(500).json({ error: err }); // Fel vid uppdatering
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Skådespelare hittades inte' });
        res.json({ message: 'Skådespelare uppdaterad' });
    });
};

// Ta bort en skådespelare
exports.deleteActor = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM actors WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err }); // Fel vid borttagning
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Skådespelare hittades inte' });
        res.json({ message: 'Skådespelare borttagen' });
    });
};
