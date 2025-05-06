const db = require('../db');

// Helper för att köra en fråga med Promise
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// Hämta alla filmer med genres, actors och imageUrl
exports.getAllMovies = async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.id AS movieId,
                m.title,
                m.releaseYear,
                m.imageUrl,
                d.name AS directorName,
                GROUP_CONCAT(DISTINCT g.name) AS genres,
                GROUP_CONCAT(DISTINCT a.name) AS actors
            FROM movies m
            LEFT JOIN directors d ON m.directorId = d.id
            LEFT JOIN movieGenres mg ON m.id = mg.movieId
            LEFT JOIN genres g ON mg.genreId = g.id
            LEFT JOIN movieActors ma ON m.id = ma.movieId
            LEFT JOIN actors a ON ma.actorId = a.id
            GROUP BY m.id, m.title, m.releaseYear, m.imageUrl, d.name;
        `;

        const results = await query(sql);

        const formatted = results.map(movie => ({
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            directorName: movie.directorName,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : []
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hämta en specifik film
exports.getMovieById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT 
                m.id AS movieId,
                m.title,
                m.releaseYear,
                m.imageUrl,
                d.name AS directorName,
                GROUP_CONCAT(DISTINCT g.name) AS genres,
                GROUP_CONCAT(DISTINCT a.name) AS actors
            FROM movies m
            LEFT JOIN directors d ON m.directorId = d.id
            LEFT JOIN movieGenres mg ON m.id = mg.movieId
            LEFT JOIN genres g ON mg.genreId = g.id
            LEFT JOIN movieActors ma ON m.id = ma.movieId
            LEFT JOIN actors a ON ma.actorId = a.id
            WHERE m.id = ?
            GROUP BY m.id, m.title, m.releaseYear, m.imageUrl, d.name;
        `;

        const results = await query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const movie = results[0];
        res.json({
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            directorName: movie.directorName,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Skapa en ny film med imageUrl
exports.createMovie = async (req, res) => {
    try {
        const { title, releaseYear, directorId, imageUrl, genreIds = [], actorIds = [] } = req.body;

        const insertMovie = 'INSERT INTO movies (title, releaseYear, directorId, imageUrl) VALUES (?, ?, ?, ?)';
        const result = await query(insertMovie, [title, releaseYear, directorId, imageUrl]);

        const movieId = result.insertId;

        // Lägg till genres
        if (genreIds.length > 0) {
            const genreValues = genreIds.map(genreId => [movieId, genreId]);
            await query('INSERT INTO movieGenres (movieId, genreId) VALUES ?', [genreValues]);
        }

        // Lägg till actors
        if (actorIds.length > 0) {
            const actorValues = actorIds.map(actorId => [movieId, actorId]);
            await query('INSERT INTO movieActors (movieId, actorId) VALUES ?', [actorValues]);
        }

        res.status(201).json({ message: 'Movie created', id: movieId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Uppdatera en film (med stöd för imageUrl om du vill)
exports.updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, releaseYear, directorId, imageUrl } = req.body;

        const sql = 'UPDATE movies SET title = ?, releaseYear = ?, directorId = ?, imageUrl = ? WHERE id = ?';
        const result = await query(sql, [title, releaseYear, directorId, imageUrl, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json({ message: 'Movie updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ta bort en film
exports.deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM movies WHERE id = ?';
        const result = await query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json({ message: 'Movie deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
