const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const storeCtrl = require('../controllers/storeCtrl');

// default route
router.get('/', storeCtrl.homePage);

// get stores
router.get('/stores', catchErrors(storeCtrl.getStores));

// add store
router.route('/add')
  .get(storeCtrl.addStore)
  .post(catchErrors(storeCtrl.createStore));

// edit store
router.get('/stores/:id/edit', catchErrors(storeCtrl.editStore));
router.post('/add/:id', catchErrors(storeCtrl.updateStore))

module.exports = router;
