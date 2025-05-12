const db = require('../db');

// Hämta alla genrer
exports.getAllGenres = (req, res) => {
    db.query('SELECT * FROM genres', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Hämta genre med ID
exports.getGenreById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM genres WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Genre not found' });
        res.json(results[0]);
    });
};

// Skapa ny genre
exports.createGenre = (req, res) => {
    const { name } = req.body;
  
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Genre name is required' });
    }
  
    // Kolla om genren redan finns
    db.query('SELECT * FROM genres WHERE name = ?', [name.trim()], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
  
      if (results.length > 0) {
        // Om genren finns, skicka tillbaka det befintliga genre-ID:t
        return res.json({ message: 'Genre already exists', id: results[0].id });
      } else {
        // Om genren inte finns, skapa en ny
        db.query('INSERT INTO genres (name) VALUES (?)', [name.trim()], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Genre created', id: result.insertId });
        });
      }
    });
  };
  

// Uppdatera genre
exports.updateGenre = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Genre name is required' });
    }

    db.query('UPDATE genres SET name = ? WHERE id = ?', [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Genre not found' });
        res.json({ message: 'Genre updated' });
    });
};

// Ta bort genre
exports.deleteGenre = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM genres WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Genre not found' });
        res.json({ message: 'Genre deleted' });
    });
};
