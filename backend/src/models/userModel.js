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

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const saveResetToken = async (userId, hashedToken, expiry) => {
  const query = 'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3';
  await db.query(query, [hashedToken, expiry, userId]);
};

const findUserByResetToken = async (hashedToken) => {
  const query = 'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()';
  const { rows } = await db.query(query, [hashedToken]);
  return rows[0];
};

const updatePassword = async (userId, hashedPassword) => {
  const query = 'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2';
  await db.query(query, [hashedPassword, userId]);
};

module.exports = {
  findUserByEmailOrMobile,
  findUserById,
  findUserByEmail,
  saveResetToken,
  findUserByResetToken,
  updatePassword,
};
