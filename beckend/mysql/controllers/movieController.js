const express = require('express');
const fs = require('fs');
const path = require('path');
const { query } = require('../db-query-wrapper');
const { findOrCreateDirector, findOrCreateActor, findOrCreateGenre } = require('../routes/helpers');
const Review = require('../../MongoDB/Models/reviewModel');
const View = require('../../MongoDB/Models/viewModel');



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
            directorBirthYear: movie.directorBirthYear,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : [],
            actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : [],
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

      if (
          isNaN(releaseYearParsed) || releaseYearParsed < 1900 || releaseYearParsed > 2100 ||
          isNaN(directorYearParsed) || directorYearParsed < 1900 || directorYearParsed > 2100 ||
          isNaN(actorYearParsed) || actorYearParsed < 1900 || actorYearParsed > 2100
      ) {
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
          const uploadPath = path.join(__dirname, '../../public/uploads/movies', filename);
          await image.mv(uploadPath);
          imageUrl = `/uploads/movies/${filename}`;
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
        directorBirthYear: movie.directorBirthYear,
        genres: movie.genres ? movie.genres.split(',') : [],
        actors: movie.actors ? movie.actors.split(',') : [],
        actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : []
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.getTopMovies = async (req, res) => {
    try {
      const allReviews = await Review.find();
  
      const reviewMap = {};
      allReviews.forEach((r) => {
        const id = r.movieId.toString();
        if (!reviewMap[id]) reviewMap[id] = [];
        reviewMap[id].push(r.rating);
      });
  
      const sql = `
        SELECT 
          m.id AS movieId,
          m.title,
          m.releaseYear,
          m.imageUrl,
          m.description,
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
      `;
  
      const results = await query(sql);
  
      const allMovies = results
        .filter((movie) => movie.imageUrl)
        .map((movie) => {
          const movieId = movie.movieId.toString();
          const ratings = reviewMap[movieId] || [];
          const average = ratings.length
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;
  
          return {
            movieId: movie.movieId,
            title: movie.title,
            releaseYear: movie.releaseYear,
            imageUrl: movie.imageUrl,
            description: movie.description,
            rating: average,
            votes: ratings.length,
            directorId: movie.directorId,
            directorName: movie.directorName,
            directorBirthYear: movie.directorBirthYear,
            genres: movie.genres ? movie.genres.split(',') : [],
            actors: movie.actors ? movie.actors.split(',') : [],
            actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : [],
          };
        });
  
      allMovies.sort((a, b) => b.rating - a.rating);
  
      res.json(allMovies);
    } catch (err) {
      console.error("Error in getTopMovies:", err);
      res.status(500).json({ error: "Failed to fetch top rated movies" });
    }
  };
  

// Hämta filmer med flest visningar
exports.getPopularMovies = async (req, res) => {
  try {
    // Hämta visningar från MongoDB
    const mongoViews = await View.aggregate([
      { $group: { _id: '$movieId', count: { $sum: 1 } } }
    ]);

    // Skapa en lookup tabell movieId antal visningar
    const viewMap = {};
    mongoViews.forEach(v => {
      viewMap[v._id] = v.count;
    });

    // Hämta alla filmer från MySQL
    const sql = `
      SELECT 
        m.id AS movieId,
        m.title,
        m.releaseYear,
        m.imageUrl,
        m.description,
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
    `;

    const results = await query(sql);

    // Kombinera med visningsdata från MongoDB och sortera
    const formatted = results.map(movie => {
      const views = viewMap[movie.movieId?.toString()] || 0;
      return {
        ...movie,
        views,
        genres: movie.genres ? movie.genres.split(',') : [],
        actors: movie.actors ? movie.actors.split(',') : [],
        actorsBirthYear: movie.actorsBirthYear ? movie.actorsBirthYear.split(',') : []
      };
    });

    const sorted = formatted.sort((a, b) => b.views - a.views).slice(0, 10);
    res.json(sorted);

  } catch (err) {
    console.error('Error in getPopularMovies:', err);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
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
      genreId,
      description
    } = req.body;

    let imageUrl = null;

    if (req.files && req.files.image) {
      const image = req.files.image;
      const filename = `${Date.now()}-${image.name}`;
      const uploadPath = path.join(__dirname, '../../public/uploads/movies', filename);
      await image.mv(uploadPath);
      imageUrl = `/uploads/movies/${filename}`;
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

    const parsedDirectorBirthYear = parseInt(directorBirthYear);
    const parsedActorBirthYear = parseInt(actorBirthYear);

    if (!isNaN(parsedDirectorBirthYear) && directorId) {
      await query(`UPDATE directors SET birthYear = ? WHERE id = ?`, [parsedDirectorBirthYear, directorId]);
    }

    if (!isNaN(parsedActorBirthYear) && actorId) {
      await query(`UPDATE actors SET birthYear = ? WHERE id = ?`, [parsedActorBirthYear, actorId]);
    }

    // Uppdatera skådespelare-koppling
    await query('DELETE FROM movieActors WHERE movieId = ?', [id]);
    if (actorId) {
      await query('INSERT INTO movieActors (movieId, actorId) VALUES (?, ?)', [id, actorId]);
    }

    // Uppdatera genre-koppling
    await query('DELETE FROM movieGenres WHERE movieId = ?', [id]);
    if (genreId) {
      await query('INSERT INTO movieGenres (movieId, genreId) VALUES (?, ?)', [id, genreId]);
    }

    res.json({ message: 'Movie updated successfully' });

  } catch (err) {
    console.error('❌ Error in updateMovie:', err);
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

    if (imageUrl && imageUrl.startsWith('/uploads/movies/')) {
      const fullPath = path.join(__dirname, '../../public', imageUrl);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    res.json({ message: 'Movie and image (if any) deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchMovies = async (req, res) => {
  const search = req.query.q?.toLowerCase() || '';

  try {
    const sql = `
      SELECT id AS movieId, title, releaseYear
      FROM movies
      WHERE LOWER(title) LIKE ?
      LIMIT 10
    `;
    const results = await query(sql, [`%${search}%`]);
    res.json(results);
  } catch (err) {
    console.error('Error in searchMovies:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

