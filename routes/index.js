const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const storeCtrl = require('../controllers/storeCtrl');

// default route
router.get('/', storeCtrl.homePage);

// add store
router.route('/add')
  .get(storeCtrl.addStore)
  .post(catchErrors(storeCtrl.createStore));

module.exports = router;
