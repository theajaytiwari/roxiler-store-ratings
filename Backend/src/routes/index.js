const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const auth = require('../controllers/authController');
const admin = require('../controllers/adminController');
const store = require('../controllers/storeController');
const rating = require('../controllers/ratingController');
const owner = require('../controllers/ownerController');

// Auth (public)
router.post('/auth/signup', auth.signup);
router.post('/auth/login', auth.login);

// Auth (any logged-in role)
router.get('/auth/me', authenticate, auth.me);
router.put('/auth/password', authenticate, auth.updatePassword);

// System Administrator
router.get('/admin/dashboard', authenticate, authorize('ADMIN'), admin.dashboard);
router.post('/admin/users', authenticate, authorize('ADMIN'), admin.createUser);
router.get('/admin/users', authenticate, authorize('ADMIN'), admin.listUsers);
router.get('/admin/users/:id', authenticate, authorize('ADMIN'), admin.getUser);
router.post('/admin/stores', authenticate, authorize('ADMIN'), admin.createStore);
router.get('/admin/stores', authenticate, authorize('ADMIN'), admin.listStores);

// Normal User
router.get('/stores', authenticate, authorize('USER'), store.listStores);
router.put('/stores/:storeId/rating', authenticate, authorize('USER'), rating.submitRating);

// Store Owner
router.get('/owner/dashboard', authenticate, authorize('OWNER'), owner.dashboard);

module.exports = router;
