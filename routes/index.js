const express = require('express');
const router = express.Router();

const { redirect } = require('../helpers');
const { catchErrors } = require('../handlers/errorHandlers');
const storeCtrl = require('../controllers/storeCtrl');
const userCtrl = require('../controllers/userCtrl');

// default route
router.get('/', redirect('/stores'));

// get stores
router.get('/stores', catchErrors(storeCtrl.getStores));

// get single store
router.get('/stores/:slug', catchErrors(storeCtrl.getStoreBySlug));

// add store
router.route('/add')
  .get(storeCtrl.addStore)
  .post(
    storeCtrl.upload,
    catchErrors(storeCtrl.resize),
    catchErrors(storeCtrl.createStore)
  );

// edit store
router.get('/stores/:id/edit', catchErrors(storeCtrl.editStore));
router.post('/add/:id',
  storeCtrl.upload,
  catchErrors(storeCtrl.resize),
  catchErrors(storeCtrl.updateStore)
);

// list tags and related stores
router.get('/tags', catchErrors(storeCtrl.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeCtrl.getStoresByTag));

// registration & login
router.route('/register')
  .get(userCtrl.registerForm)
  .post(
    userCtrl.validateRegistration,
    catchErrors(userCtrl.register)
  );

router.route('/login')
  .get(userCtrl.loginForm);

// default export
module.exports = router;
