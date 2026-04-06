const Business = require('../models/Business');

// ── Helpers ──────────────────────────────────────────────────

// Build the full image URL so the frontend never has to guess
const buildImageUrl = (req, image) => {
  if (!image) return null;

  // Already a full URL (Unsplash, Cloudinary, etc.) — pass through
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  // Local filename stored in /uploads — build absolute URL
  const protocol = req.protocol;                      // http or https
  const host     = req.get('host');                    // localhost:5000
  const clean    = image.replace(/^\/?(uploads\/)?/, '');  // strip leading slashes/folder
  return `${protocol}://${host}/uploads/${clean}`;
};

// Category-specific fallback images (high-quality Unsplash)
const CATEGORY_FALLBACKS = {
  Bakery:   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
  Medical:  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600',
  Salon:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
  Grocery:  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
  Coaching: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600';

// ── Controllers ──────────────────────────────────────────────

/**
 * GET /api/businesses
 * Returns all businesses with full image URLs
 */
const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().sort({ rating: -1 });

    const result = businesses.map(biz => {
      const obj = biz.toObject();
      const imageUrl = buildImageUrl(req, obj.image)
        || CATEGORY_FALLBACKS[obj.category]
        || DEFAULT_FALLBACK;

      return {
        ...obj,
        imageUrl,                       // always a valid URL the frontend can use
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('[getAllBusinesses] Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching businesses' });
  }
};

/**
 * GET /api/businesses/:id
 * Returns a single business by its custom `id` field
 */
const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const obj = business.toObject();
    const imageUrl = buildImageUrl(req, obj.image)
      || CATEGORY_FALLBACKS[obj.category]
      || DEFAULT_FALLBACK;

    return res.json({ ...obj, imageUrl });
  } catch (error) {
    console.error('[getBusinessById] Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching business' });
  }
};

/**
 * GET /api/businesses/category/:category
 * Returns businesses filtered by category
 */
const getBusinessesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const businesses = await Business.find({ category }).sort({ rating: -1 });

    const result = businesses.map(biz => {
      const obj = biz.toObject();
      const imageUrl = buildImageUrl(req, obj.image)
        || CATEGORY_FALLBACKS[obj.category]
        || DEFAULT_FALLBACK;
      return { ...obj, imageUrl };
    });

    return res.json(result);
  } catch (error) {
    console.error('[getBusinessesByCategory] Error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBusinesses,
  getBusinessById,
  getBusinessesByCategory,
};
