const express = require('express');
const fs = require('fs');
const path = require('path');
const { query } = require('../db-query-wrapper');
const { findOrCreateDirector, findOrCreateActor, findOrCreateGenre } = require('../routes/helpers');


// Hämta alla filmer
exports.getAllMovies = async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.id AS movieId,
                m.title,
                m.releaseYear,
                m.imageUrl,
                m.description,
                d.id AS directorId,
                d.name AS directorName,
                d.birthYear AS directorBirthYear,  -- Regissörens födelseår
                GROUP_CONCAT(DISTINCT g.name) AS genres,
                GROUP_CONCAT(DISTINCT a.name) AS actors,
                GROUP_CONCAT(DISTINCT a.birthYear) AS actorsBirthYear  -- Skådespelarnas födelseår
            FROM movies m
            LEFT JOIN directors d ON m.directorId = d.id
            LEFT JOIN movieGenres mg ON m.id = mg.movieId
            LEFT JOIN genres g ON mg.genreId = g.id
            LEFT JOIN movieActors ma ON m.id = ma.movieId
            LEFT JOIN actors a ON ma.actorId = a.id
            GROUP BY m.id, d.id, d.name, m.description;
        `;
        const results = await query(sql);
        const formatted = results.map(movie => ({
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            description: movie.description,
            directorId: movie.directorId,
            directorName: movie.directorName,
            directorBirthYear: movie.directorBirthYear,  // Lägg till regissörens födelseår
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : [],
            actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : [],  // Lägg till skådespelarnas födelseår
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Skapa en ny film
exports.createMovie = async (req, res) => {
    try {
        const { title, releaseYear, description, directorName, directorBirthYear, actorName, actorBirthYear, genreName } = req.body;

        // Validering av fält
        if (!title || !releaseYear || !directorName || !directorBirthYear || !actorName || !actorBirthYear || !genreName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const releaseYearParsed = parseInt(releaseYear);
        const directorYearParsed = parseInt(directorBirthYear);
        const actorYearParsed = parseInt(actorBirthYear);

        if (isNaN(releaseYearParsed) || releaseYearParsed < 1900 || releaseYearParsed > 2100 ||
            isNaN(directorYearParsed) || directorYearParsed < 1900 || directorYearParsed > 2100 ||
            isNaN(actorYearParsed) || actorYearParsed < 1900 || actorYearParsed > 2100) {
            return res.status(400).json({ message: 'Invalid years provided' });
        }

        // Kontrollera om filmen med titel och releaseår redan finns
        const movieCheck = await query('SELECT id FROM movies WHERE title = ? AND releaseYear = ?', [title, releaseYear]);
        if (movieCheck.length > 0) {
            return res.status(409).json({ message: 'A movie with this title and year already exists.' });
        }

        let imageUrl = null;
        if (req.files && req.files.image) {
            const image = req.files.image;
            const filename = `${Date.now()}-${image.name}`;
            const uploadPath = path.join(__dirname, '../../public/uploads', filename);
            await image.mv(uploadPath);
            imageUrl = `/uploads/${filename}`;
        }

        const directorId = await findOrCreateDirector(directorName.trim(), directorYearParsed);
        const actorId = await findOrCreateActor(actorName.trim(), actorYearParsed);
        const genreId = await findOrCreateGenre(genreName.trim());

        const result = await query(
            `INSERT INTO movies (title, releaseYear, directorId, imageUrl, description) 
            VALUES (?, ?, ?, ?, ?)`, 
            [title.trim(), releaseYearParsed, directorId, imageUrl, description || null]
        );

        const movieId = result.insertId;

        // Lägg till relationer
        await query('INSERT INTO movieActors (movieId, actorId) VALUES (?, ?)', [movieId, actorId]);
        await query('INSERT INTO movieGenres (movieId, genreId) VALUES (?, ?)', [movieId, genreId]);

        res.status(201).json({ message: 'Movie created', id: movieId });
    } catch (err) {
        console.error('❌ Error in createMovie:', err);
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
            m.description,
            m.rating,
            m.views,
            d.id AS directorId,
            d.name AS directorName,
            d.birthYear AS directorBirthYear,
            GROUP_CONCAT(DISTINCT g.name) AS genres,
            GROUP_CONCAT(DISTINCT a.name) AS actors,
            GROUP_CONCAT(DISTINCT a.birthYear) AS actorsBirthYear
        FROM movies m
        LEFT JOIN directors d ON m.directorId = d.id
        LEFT JOIN movieGenres mg ON m.id = mg.movieId
        LEFT JOIN genres g ON mg.genreId = g.id
        LEFT JOIN movieActors ma ON m.id = ma.movieId
        LEFT JOIN actors a ON ma.actorId = a.id
        WHERE m.id = ?
        GROUP BY m.id, d.id, d.name, m.description;
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
        rating: movie.rating,
        views: movie.views,
        imageUrl: movie.imageUrl,
        description: movie.description,
        directorId: movie.directorId,
        directorName: movie.directorName,
        directorBirthYear: movie.directorBirthYear, // ✅ inkluderat
        genres: movie.genres ? movie.genres.split(',') : [],
        actors: movie.actors ? movie.actors.split(',') : [],
        actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : [] // ✅ inkluderat
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
            m.description,
            m.rating,
            d.id AS directorId,
            d.name AS directorName,
            d.birthYear AS directorBirthYear,
            GROUP_CONCAT(DISTINCT g.name) AS genres,
            GROUP_CONCAT(DISTINCT a.name) AS actors,
            GROUP_CONCAT(DISTINCT a.birthYear) AS actorsBirthYear
        FROM movies m
        LEFT JOIN directors d ON m.directorId = d.id
        LEFT JOIN movieGenres mg ON m.id = mg.movieId
        LEFT JOIN genres g ON mg.genreId = g.id
        LEFT JOIN movieActors ma ON m.id = ma.movieId
        LEFT JOIN actors a ON ma.actorId = a.id
        GROUP BY m.id, d.id, m.description
        ORDER BY m.rating DESC
        LIMIT 10;
      `;
  
      const results = await query(sql);
  
      const formatted = results.map((movie) => ({
        movieId: movie.movieId,
        title: movie.title,
        releaseYear: movie.releaseYear,
        imageUrl: movie.imageUrl,
        description: movie.description,
        rating: movie.rating,
        directorId: movie.directorId,
        directorName: movie.directorName,
        directorBirthYear: movie.directorBirthYear, // ✅
        genres: movie.genres ? movie.genres.split(',') : [],
        actors: movie.actors ? movie.actors.split(',') : [],
        actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : [] // ✅
      }));
  
      res.json(formatted);
    } catch (err) {
      console.error("Error in getTopMovies:", err);
      res.status(500).json({ error: "Failed to fetch top movies" });
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
            m.description,
            m.views,
            d.id AS directorId,
            d.name AS directorName,
            d.birthYear AS directorBirthYear,
            GROUP_CONCAT(DISTINCT g.name) AS genres,
            GROUP_CONCAT(DISTINCT a.name) AS actors,
            GROUP_CONCAT(DISTINCT a.birthYear) AS actorsBirthYear
        FROM movies m
        LEFT JOIN directors d ON m.directorId = d.id
        LEFT JOIN movieGenres mg ON m.id = mg.movieId
        LEFT JOIN genres g ON mg.genreId = g.id
        LEFT JOIN movieActors ma ON m.id = ma.movieId
        LEFT JOIN actors a ON ma.actorId = a.id
        GROUP BY m.id, d.id, m.description
        ORDER BY m.views DESC
        LIMIT 10;
      `;
  
      const results = await query(sql);
  
      const formatted = results.map((movie) => ({
        movieId: movie.movieId,
        title: movie.title,
        releaseYear: movie.releaseYear,
        imageUrl: movie.imageUrl,
        description: movie.description,
        views: movie.views,
        directorId: movie.directorId,
        directorName: movie.directorName,
        directorBirthYear: movie.directorBirthYear,
        genres: movie.genres ? movie.genres.split(',') : [],
        actors: movie.actors ? movie.actors.split(',') : [],
        actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : [] 
      }));
  
      res.json(formatted);
    } catch (err) {
      console.error('Error in getPopularMovies:', err);
      res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
  };
  
  

// Skapa en ny film
exports.createMovie = async (req, res) => {
    try {
      const { title, releaseYear, directorId, description } = req.body;
  
      // Validering av fält
      if (!title || !releaseYear) {
        return res.status(400).json({ message: 'Title and release year are required.' });
      }
  
      const releaseYearParsed = parseInt(releaseYear);
      const directorIdParsed = directorId ? parseInt(directorId) : null;
  
      if (isNaN(releaseYearParsed) || releaseYearParsed < 1900 || releaseYearParsed > 2100) {
        return res.status(400).json({ message: 'Release year must be between 1900 and 2100' });
      }
  
      let imageUrl = null;
      if (req.files && req.files.image) {
        const image = req.files.image;
        const filename = `${Date.now()}-${image.name}`;
        const uploadPath = path.join(__dirname, '../../public/uploads', filename);
        await image.mv(uploadPath);
        imageUrl = `/uploads/${filename}`;
      }
  
      const sql = `
        INSERT INTO movies (title, releaseYear, directorId, imageUrl, description)
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await query(sql, [
        title,
        releaseYearParsed,
        directorIdParsed,
        imageUrl,
        description || null
      ]);
  
      res.status(201).json({ message: 'Movie created', id: result.insertId });
    } catch (err) {
      console.error('❌ Error in createMovie:', err);
      res.status(500).json({ error: err.message });
    }
  };
  

// Uppdatera film
exports.updateMovie = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        releaseYear,
        directorId,
        directorBirthYear,
        actorId,
        actorBirthYear,
        description
      } = req.body;
  
      let imageUrl = null;
  
      if (req.files && req.files.image) {
        const image = req.files.image;
        const filename = `${Date.now()}-${image.name}`;
        const uploadPath = path.join(__dirname, '../../public/uploads', filename);
        await image.mv(uploadPath);
        imageUrl = `/uploads/${filename}`;
      }
  
      const updateMovieSql = `
        UPDATE movies 
        SET title = ?, releaseYear = ?, directorId = ?, imageUrl = COALESCE(?, imageUrl), description = ?
        WHERE id = ?
      `;
      const result = await query(updateMovieSql, [
        title,
        releaseYear,
        directorId,
        imageUrl,
        description,
        id
      ]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Movie not found' });
      }
  
      if (directorBirthYear && directorId) {
        await query(`UPDATE directors SET birthYear = ? WHERE id = ?`, [directorBirthYear, directorId]);
      }
  
      if (actorBirthYear && actorId) {
        await query(`UPDATE actors SET birthYear = ? WHERE id = ?`, [actorBirthYear, actorId]);
      }
  
      res.json({ message: 'Movie updated successfully' });
    } catch (err) {
      console.error('Error in updateMovie:', err);
      res.status(500).json({ error: err.message });
    }
  };
  

// Ta bort film + bild
exports.deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        const resultImage = await query('SELECT imageUrl FROM movies WHERE id = ?', [id]);
        if (resultImage.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const imageUrl = resultImage[0].imageUrl;

        const result = await query('DELETE FROM movies WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        if (imageUrl && imageUrl.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, '../../public', imageUrl);
            if (fullPath.includes(path.normalize('/public/uploads/'))) {
                fs.unlink(fullPath, (err) => {
                    if (err) console.warn(`Kunde inte ta bort bild: ${fullPath}`, err.message);
                });
            }
        }

        res.json({ message: 'Movie and image (if any) deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
