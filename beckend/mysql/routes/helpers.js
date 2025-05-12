// helpers.js
const { query } = require('../db-query-wrapper');

exports.findOrCreateDirector = async (name, birthYear) => {
  const existing = await query('SELECT id FROM directors WHERE name = ? AND birthYear = ?', [name, birthYear]);
  if (existing.length > 0) return existing[0].id;

  const result = await query('INSERT INTO directors (name, birthYear) VALUES (?, ?)', [name, birthYear]);
  return result.insertId;
};

exports.findOrCreateActor = async (name, birthYear) => {
  const existing = await query('SELECT id FROM actors WHERE name = ? AND birthYear = ?', [name, birthYear]);
  if (existing.length > 0) return existing[0].id;

  const result = await query('INSERT INTO actors (name, birthYear) VALUES (?, ?)', [name, birthYear]);
  return result.insertId;
};

exports.findOrCreateGenre = async (name) => {
  const existing = await query('SELECT id FROM genres WHERE name = ?', [name]);
  if (existing.length > 0) return existing[0].id;

  const result = await query('INSERT INTO genres (name) VALUES (?)', [name]);
  return result.insertId;
};
