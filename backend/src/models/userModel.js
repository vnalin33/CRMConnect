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

module.exports = {
  findUserByEmailOrMobile,
  findUserById,
};
