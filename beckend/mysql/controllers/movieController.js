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

// Hämta alla filmer
exports.getAllMovies = async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.id AS movieId,
                m.title,
                m.releaseYear,
                m.imageUrl,
                d.id AS directorId,
                d.name AS directorName,
                GROUP_CONCAT(DISTINCT g.name) AS genres,
                GROUP_CONCAT(DISTINCT a.name) AS actors
            FROM movies m
            LEFT JOIN directors d ON m.directorId = d.id
            LEFT JOIN movieGenres mg ON m.id = mg.movieId
            LEFT JOIN genres g ON mg.genreId = g.id
            LEFT JOIN movieActors ma ON m.id = ma.movieId
            LEFT JOIN actors a ON ma.actorId = a.id
            GROUP BY m.id, d.id, d.name;
        `;
        const results = await query(sql);
        const formatted = results.map(movie => ({
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            directorId: movie.directorId,
            directorName: movie.directorName,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : []
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hämta en film
exports.getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT 
                m.id AS movieId,
                m.title,
                m.releaseYear,
                m.imageUrl,
                d.id AS directorId,
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
            GROUP BY m.id, d.id, d.name;
        `;
        const results = await query(sql, [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Movie not found' });

        const movie = results[0];
        res.json({
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            directorId: movie.directorId,
            directorName: movie.directorName,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hämta top 10 filmer med högst rating
exports.getTopMovies = async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.id AS movieId,
                m.title,
                m.releaseYear,
                m.imageUrl,
                m.rating,
                d.id AS directorId,
                d.name AS directorName,
                GROUP_CONCAT(DISTINCT g.name) AS genres,
                GROUP_CONCAT(DISTINCT a.name) AS actors
            FROM movies m
            LEFT JOIN directors d ON m.directorId = d.id
            LEFT JOIN movieGenres mg ON m.id = mg.movieId
            LEFT JOIN genres g ON mg.genreId = g.id
            LEFT JOIN movieActors ma ON m.id = ma.movieId
            LEFT JOIN actors a ON ma.actorId = a.id
            GROUP BY m.id, d.id
            ORDER BY m.rating DESC
            LIMIT 10;
        `;
        const results = await query(sql);
        const formatted = results.map(movie => ({
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            rating: movie.rating,
            directorId: movie.directorId,
            directorName: movie.directorName,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : []
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch top movies' });
    }
};

// Hämta top 10 filmer med flest visningar
exports.getPopularMovies = async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.id AS movieId,
                m.title,
                m.releaseYear,
                m.imageUrl,
                m.views,
                d.id AS directorId,
                d.name AS directorName,
                GROUP_CONCAT(DISTINCT g.name) AS genres,
                GROUP_CONCAT(DISTINCT a.name) AS actors
            FROM movies m
            LEFT JOIN directors d ON m.directorId = d.id
            LEFT JOIN movieGenres mg ON m.id = mg.movieId
            LEFT JOIN genres g ON mg.genreId = g.id
            LEFT JOIN movieActors ma ON m.id = ma.movieId
            LEFT JOIN actors a ON ma.actorId = a.id
            GROUP BY m.id, d.id
            ORDER BY m.views DESC
            LIMIT 10;
        `;
        const results = await query(sql);
        const formatted = results.map(movie => ({
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            views: movie.views,
            directorId: movie.directorId,
            directorName: movie.directorName,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : []
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
};

// Skapa en ny film
exports.createMovie = async (req, res) => {
    try {
        const { title, releaseYear, directorId } = req.body;
        let imageUrl = null;

        const directorIdParsed = directorId ? Number(directorId) : null;

        if (req.files && req.files.image) {
            const image = req.files.image;
            const filename = `${Date.now()}-${image.name}`;
            const uploadPath = `${__dirname}/../../public/uploads/${filename}`;
            await image.mv(uploadPath);
            imageUrl = `/uploads/${filename}`;
        }

        const sql = 'INSERT INTO movies (title, releaseYear, directorId, imageUrl) VALUES (?, ?, ?, ?)';
        const result = await query(sql, [title, releaseYear, directorIdParsed, imageUrl]);

        res.status(201).json({ message: 'Movie created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Uppdatera film
exports.updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, releaseYear, directorId } = req.body;
        let imageUrl = req.body.imageUrl || null;

        const directorIdParsed = directorId ? Number(directorId) : null;

        if (req.files && req.files.image) {
            const image = req.files.image;
            const filename = `${Date.now()}-${image.name}`;
            const uploadPath = `${__dirname}/../../public/uploads/${filename}`;
            await image.mv(uploadPath);
            imageUrl = `/uploads/${filename}`;
        }

        const sql = 'UPDATE movies SET title = ?, releaseYear = ?, directorId = ?, imageUrl = ? WHERE id = ?';
        const result = await query(sql, [title, releaseYear, directorIdParsed, imageUrl, id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Movie not found' });

        res.json({ message: 'Movie updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ta bort film
exports.deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM movies WHERE id = ?';
        const result = await query(sql, [id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Movie not found' });

        res.json({ message: 'Movie deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
