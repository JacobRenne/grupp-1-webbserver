const db = require('./db'); // ändra till '../db' om du lägger filen utanför mysql/

exports.query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
