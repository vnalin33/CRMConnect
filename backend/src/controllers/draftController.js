const draftModel = require('../models/draftModel');

const saveDraft = async (req, res, next) => {
  try {
    const { draftId, ...draftData } = req.body;
    let result;
    if (draftId) {
      result = await draftModel.updateDraft(draftId, req.user.id, draftData);
      if (!result) {
        return res.status(404).json({ success: false, error: { message: 'Draft not found' } });
      }
    } else {
      result = await draftModel.saveDraft(req.user.id, draftData);
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getDrafts = async (req, res, next) => {
  try {
    const drafts = await draftModel.getDrafts(req.user.id);
    res.status(200).json({ success: true, data: drafts });
  } catch (err) {
    next(err);
  }
};

const deleteDraft = async (req, res, next) => {
  try {
    await draftModel.deleteDraft(req.params.id, req.user.id);
    // We return 200 even if the draft was not found to make the delete operation idempotent.
    // This helps resolve issues where the client's local cache has a draft that was already deleted.
    res.status(200).json({ success: true, message: 'Draft deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  saveDraft,
  getDrafts,
  deleteDraft,
};
