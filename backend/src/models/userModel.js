const db = require('../config/db');

const findUserByEmailOrMobile = async (identifier) => {
  const query = 'SELECT * FROM users WHERE email = $1 OR mobile = $2';
  const { rows } = await db.query(query, [identifier, identifier]);
  return rows[0];
};

const findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateResetToken = async (email, token, expiry) => {
  const query = 'UPDATE users SET reset_token = $1, token_expiry = $2 WHERE email = $3 RETURNING *';
  const { rows } = await db.query(query, [token, expiry, email]);
  return rows[0];
};

const findUserByResetToken = async (token) => {
  const query = 'SELECT * FROM users WHERE reset_token = $1 AND token_expiry > NOW()';
  const { rows } = await db.query(query, [token]);
  return rows[0];
};

const updatePassword = async (id, hashedPassword) => {
  const query = 'UPDATE users SET password = $1, reset_token = NULL, token_expiry = NULL WHERE id = $2';
  await db.query(query, [hashedPassword, id]);
};

module.exports = {
  findUserByEmailOrMobile,
  findUserById,
  updateResetToken,
  findUserByResetToken,
  updatePassword,
};
