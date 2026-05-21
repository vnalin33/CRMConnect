const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/authMiddleware');
const connectorController = require('../controllers/connectorController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profile_pictures'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const router = express.Router();

// All routes require JWT authentication
router.use(authenticate);

router.get('/profile', connectorController.getProfile);
router.put('/profile/info', connectorController.updatePersonalInfo);
router.put('/profile/bank', connectorController.updateBankDetails);
router.put('/profile/tax', connectorController.updateTaxDetails);
router.put('/profile/password', connectorController.changePassword);
router.post('/profile-picture', upload.single('profilePicture'), connectorController.uploadProfilePicture);

module.exports = router;
