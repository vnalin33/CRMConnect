const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draftController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', draftController.getDrafts);
router.post('/', draftController.saveDraft);
router.delete('/:id', draftController.deleteDraft);

module.exports = router;
