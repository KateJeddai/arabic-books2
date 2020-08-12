const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../middleware/authenticate');
const {uploadHoliday} = require('../controllers/holidays');

// upload a holiday
router.post('/upload-holiday', ensureAuthenticated, uploadHoliday);

module.exports = router;
