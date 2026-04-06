const express = require('express');
const router  = express.Router();
const {
  getAllBusinesses,
  getBusinessById,
  getBusinessesByCategory,
} = require('../controllers/businessController');

// GET  /api/businesses              → all businesses
router.get('/',              getAllBusinesses);

// GET  /api/businesses/category/:category  → by category
router.get('/category/:category', getBusinessesByCategory);

// GET  /api/businesses/:id          → single business
router.get('/:id',           getBusinessById);

module.exports = router;
