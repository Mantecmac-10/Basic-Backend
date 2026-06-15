const express = require('express');
const { generateshorturl, handlegetanalytics } = require('../controllers/url');
const { restrictionofguest } = require('../middlewares/auth');
const router = express.Router();

router.post('/', restrictionofguest, generateshorturl);

router.get('/analytics/:shortId', handlegetanalytics);

module.exports = router;
