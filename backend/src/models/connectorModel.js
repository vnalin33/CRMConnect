const db = require('../config/db');

const findByEmailOrMobile = async (identifier) => {
  const query = 'SELECT * FROM connector WHERE emailid = $1 OR mobilenumber = $1';
  const { rows } = await db.query(query, [identifier]);
  return rows[0];
};

const findByEmail = async (email) => {
  const query = 'SELECT * FROM connector WHERE emailid = $1';
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const findByMobile = async (mobile) => {
  const query = 'SELECT * FROM connector WHERE mobilenumber = $1';
  const { rows } = await db.query(query, [mobile]);
  return rows[0];
};

const findByEmailExcludingUser = async (email, userId) => {
  const query = 'SELECT * FROM connector WHERE emailid = $1 AND id != $2';
  const { rows } = await db.query(query, [email, userId]);
  return rows[0];
};

const findByMobileExcludingUser = async (mobile, userId) => {
  const query = 'SELECT * FROM connector WHERE mobilenumber = $1 AND id != $2';
  const { rows } = await db.query(query, [mobile, userId]);
  return rows[0];
};

const findById = async (id) => {
  const query = `
    SELECT id, name, emailid, mobilenumber, location, address, profession, ifsc, accountnumber, branch, bank_name, account_holder_name, isactive, profile_picture, dob, pan_number, is_gst_registered, gst_number
    FROM connector WHERE id = $1
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updatePersonalInfo = async (id, { name, emailid, mobilenumber, location, address, profession }) => {
  const query = `
    UPDATE connector
    SET name = $1, emailid = $2, mobilenumber = $3, location = $4, address = $5, profession = $6, "updatedDate" = NOW()
    WHERE id = $7
    RETURNING id, name, emailid, mobilenumber, location, address, profession
  `;
  const { rows } = await db.query(query, [name, emailid, mobilenumber, location, address, profession, id]);
  return rows[0];
};

const updateBankDetails = async (id, { ifsc, accountnumber, branch, bank_name, account_holder_name }) => {
  const query = `
    UPDATE connector
    SET ifsc = $1, accountnumber = $2, branch = $3, bank_name = $4, account_holder_name = $5, "updatedDate" = NOW()
    WHERE id = $6
    RETURNING id, ifsc, accountnumber, branch, bank_name, account_holder_name
  `;
  const { rows } = await db.query(query, [ifsc, accountnumber, branch, bank_name, account_holder_name, id]);
  return rows[0];
};

const updateTaxDetails = async (id, { pan_number, is_gst_registered, gst_number }) => {
  const query = `
    UPDATE connector
    SET pan_number = $1, is_gst_registered = $2, gst_number = $3, "updatedDate" = NOW()
    WHERE id = $4
    RETURNING id, pan_number, is_gst_registered, gst_number
  `;
  const { rows } = await db.query(query, [pan_number, is_gst_registered, gst_number, id]);
  return rows[0];
};

const updatePassword = async (id, hashedPassword) => {
  const query = 'UPDATE connector SET password = $1, "updatedDate" = NOW() WHERE id = $2';
  await db.query(query, [hashedPassword, id]);
};

const saveResetToken = async (userId, hashedToken, expiry) => {
  const query = 'UPDATE connector SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3';
  await db.query(query, [hashedToken, expiry, userId]);
};

const findUserByResetToken = async (hashedToken) => {
  const query = 'SELECT * FROM connector WHERE reset_token = $1 AND reset_token_expiry > NOW()';
  const { rows } = await db.query(query, [hashedToken]);
  return rows[0];
};

const updateProfilePicture = async (id, profilePictureUrl) => {
  const query = 'UPDATE connector SET profile_picture = $1, "updatedDate" = NOW() WHERE id = $2 RETURNING id, profile_picture';
  const { rows } = await db.query(query, [profilePictureUrl, id]);
  return rows[0];
};

const create = async ({ name, emailid, mobilenumber, password, dob, profession, isactive = true }) => {
  const query = `
    INSERT INTO connector (name, emailid, mobilenumber, password, dob, profession, isactive, "createdDate", "updatedDate")
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING id, name, emailid, mobilenumber, dob, profession, isactive
  `;
  const { rows } = await db.query(query, [name, emailid, mobilenumber, password, dob, profession || null, isactive]);
  return rows[0];
};

module.exports = {
  findByEmailOrMobile,
  findByEmail,
  findByMobile,
  findByEmailExcludingUser,
  findByMobileExcludingUser,
  findById,
  updatePersonalInfo,
  updateBankDetails,
  updateTaxDetails,
  updatePassword,
  saveResetToken,
  findUserByResetToken,
  updateProfilePicture,
  create,
};
