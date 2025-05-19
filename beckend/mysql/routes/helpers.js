// helpers.js
const { query } = require('../db-query-wrapper');

// Hitta en befintlig regissör eller skapa en ny om den inte finns
exports.findOrCreateDirector = async (name, birthYear) => {
  // Kontrollera om regissören redan finns i databasen
  const existing = await query('SELECT id FROM directors WHERE name = ? AND birthYear = ?', [name, birthYear]);
  if (existing.length > 0) return existing[0].id;

  // Om inte, skapa en ny regissör och returnera det nya ID:t
  const result = await query('INSERT INTO directors (name, birthYear) VALUES (?, ?)', [name, birthYear]);
  return result.insertId;
};

// Hitta en befintlig skådespelare eller skapa en ny om den inte finns
exports.findOrCreateActor = async (name, birthYear) => {
  // Kontrollera om skådespelaren redan finns i databasen
  const existing = await query('SELECT id FROM actors WHERE name = ? AND birthYear = ?', [name, birthYear]);
  if (existing.length > 0) return existing[0].id;

  // Om inte, skapa en ny skådespelare och returnera det nya ID:t
  const result = await query('INSERT INTO actors (name, birthYear) VALUES (?, ?)', [name, birthYear]);
  return result.insertId;
};

// Hitta en befintlig genre eller skapa en ny om den inte finns
exports.findOrCreateGenre = async (name) => {
  // Kontrollera om genren redan finns i databasen
  const existing = await query('SELECT id FROM genres WHERE name = ?', [name]);
  if (existing.length > 0) return existing[0].id;

  // Om inte, skapa en ny genre och returnera det nya ID:t
  const result = await query('INSERT INTO genres (name) VALUES (?)', [name]);
  return result.insertId;
};
