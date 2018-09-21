const express = require('express');
const router = express.Router();

const storeCtrl = require('../controllers/storeCtrl')

// Do work here
router.get('/', storeCtrl.homePage);

module.exports = router;
