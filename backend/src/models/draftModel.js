const db = require('../config/db');

const saveDraft = async (connectorid, draftData) => {
  const query = `
    INSERT INTO leaddrafts (connectorid, draft_data)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [connectorid, JSON.stringify(draftData)]);
  return rows[0];
};

const updateDraft = async (draftId, connectorid, draftData) => {
  const query = `
    UPDATE leaddrafts 
    SET draft_data = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND connectorid = $3
    RETURNING *;
  `;
  const { rows } = await db.query(query, [JSON.stringify(draftData), draftId, connectorid]);
  return rows[0];
};

const getDrafts = async (connectorid) => {
  const query = `
    SELECT * FROM leaddrafts 
    WHERE connectorid = $1 
    ORDER BY updated_at DESC;
  `;
  const { rows } = await db.query(query, [connectorid]);
  return rows;
};

const deleteDraft = async (draftId, connectorid) => {
  const query = `
    DELETE FROM leaddrafts 
    WHERE id = $1 AND connectorid = $2
    RETURNING id;
  `;
  const { rows } = await db.query(query, [draftId, connectorid]);
  return rows.length > 0;
};

module.exports = {
  saveDraft,
  updateDraft,
  getDrafts,
  deleteDraft,
};
