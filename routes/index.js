const express = require('express');
const router = express.Router();

const { redirect } = require('../helpers');
const { catchErrors } = require('../handlers/errors');
const authCtrl = require('../controllers/authCtrl');
const storeCtrl = require('../controllers/storeCtrl');
const userCtrl = require('../controllers/userCtrl');

// get stores (the default route)
router.get([
  '/',
  '/stores'
], catchErrors(storeCtrl.getStores));

// get single store
router.get('/stores/:slug', catchErrors(storeCtrl.getStoreBySlug));

// add store
router.route('/add')
  .get(
    authCtrl.isLoggedIn,
    storeCtrl.addStore
  )
  .post(
    storeCtrl.upload,
    catchErrors(storeCtrl.resize),
    catchErrors(storeCtrl.createStore)
  );

// edit store
router.get('/stores/:id/edit',
  authCtrl.isLoggedIn,
  catchErrors(storeCtrl.editStore)
);
router.post('/add/:id',
  storeCtrl.upload,
  catchErrors(storeCtrl.resize),
  catchErrors(storeCtrl.updateStore)
);

// list tags and related stores
router.get('/tags', catchErrors(storeCtrl.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeCtrl.getStoresByTag));

// registration, login, logout
router.route('/register')
  .get(userCtrl.registerForm)
  .post(
    userCtrl.validateRegistration,
    catchErrors(userCtrl.register),
    authCtrl.login
  );

router.route('/login')
  .get(userCtrl.loginForm)
  .post(authCtrl.login);

router.get('/logout', authCtrl.logout);

// edit account
router.route('/account')
  .get(
    authCtrl.isLoggedIn,
    userCtrl.account
  )
  .post(catchErrors(userCtrl.updateAccount));

// reset password
router.route('/account/forgot')
  .post(catchErrors(authCtrl.forgotPassword));

router.route('/account/reset/:token')
  .get(catchErrors(authCtrl.resetPassword))
  .post(
    authCtrl.validatePassword,
    catchErrors(authCtrl.updatePassword)
  );

/**
 * API endpoints
 */

router.get('/api/search/', catchErrors(storeCtrl.searchStores));

// default export
module.exports = router;
