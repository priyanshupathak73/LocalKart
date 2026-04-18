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

// Category-specific fallback images. Multiple options reduce repeated images
// when businesses are missing explicit image URLs.
const CATEGORY_FALLBACKS = {
  Bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600',
  ],
  Medical: [
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600',
  ],
  Salon: [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
    'https://images.unsplash.com/photo-1585747860715-cd4628902d4a?w=600',
  ],
  Grocery: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    'https://images.unsplash.com/photo-1543168256-418811576931?w=600',
  ],
  Coaching: [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
    'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=600',
  ],
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600';
const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildDynamicCategoryImage = (category = 'business', businessId = '', width = 400, height = 300) => {
  const safeCategory = encodeURIComponent(String(category || 'business').toLowerCase());
  const sig = hashString(`${category}-${businessId}`) % 1000;
  return `https://source.unsplash.com/${width}x${height}/?${safeCategory}&sig=${sig}`;
};

const pickFallbackImage = (category, businessId = '') => {
  const options = CATEGORY_FALLBACKS[category];
  if (!Array.isArray(options) || options.length === 0) {
    return DEFAULT_FALLBACK;
  }

  const index = hashString(`${category}-${businessId}`) % options.length;
  return options[index] || options[0] || DEFAULT_FALLBACK;
};

const buildBusinessImageFields = (req, businessObj) => {
  const imageCandidate = [businessObj.imageUrl, businessObj.image, businessObj.thumbnail]
    .find(isNonEmptyString);

  const resolvedPrimaryImage = imageCandidate ? buildImageUrl(req, imageCandidate) : null;
  const fallbackImage = pickFallbackImage(businessObj.category, businessObj.id);
  const dynamicFallbackImage = buildDynamicCategoryImage(businessObj.category, businessObj.id);
  const imageUrl = resolvedPrimaryImage || fallbackImage || dynamicFallbackImage || DEFAULT_FALLBACK;
  const thumbnail = isNonEmptyString(businessObj.thumbnail)
    ? buildImageUrl(req, businessObj.thumbnail)
    : imageUrl;

  return {
    imageUrl,
    thumbnail,
    fallbackImage,
    dynamicFallbackImage,
    hasPrimaryImage: Boolean(resolvedPrimaryImage),
  };
};

const ensureUniqueImageUrls = (businesses = []) => {
  const seen = new Set();

  return businesses.map((business) => {
    let finalImageUrl = business.imageUrl;

    if (!isNonEmptyString(finalImageUrl)) {
      finalImageUrl = buildDynamicCategoryImage(business.category, business.id);
    }

    if (seen.has(finalImageUrl)) {
      // Force a unique category-relevant image if URL repeats in API output.
      finalImageUrl = buildDynamicCategoryImage(
        business.category,
        business.id || `${business.name}-${business._id || ''}`,
      );
    }

    seen.add(finalImageUrl);

    return {
      ...business,
      imageUrl: finalImageUrl,
      thumbnail: isNonEmptyString(business.thumbnail) ? business.thumbnail : finalImageUrl,
    };
  });
};

// ── Controllers ──────────────────────────────────────────────

/**
 * GET /api/businesses
 * Returns all businesses with full image URLs
 */
const getAllBusinesses = async (req, res) => {
  try {
    const { category, search } = req.query;
    const normalizedCategory = String(category || '').trim().toLowerCase();
    const normalizedSearch = String(search || '').trim().toLowerCase();
    const safeCategory = escapeRegExp(normalizedCategory);
    const safeSearch = escapeRegExp(normalizedSearch);
    const mongoFilter = {};

    if (normalizedCategory && normalizedCategory !== 'all') {
      mongoFilter.category = { $regex: `^${safeCategory}$`, $options: 'i' };
    }

    if (normalizedSearch) {
      mongoFilter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tagline: { $regex: safeSearch, $options: 'i' } },
        { address: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const businesses = await Business.find(mongoFilter).sort({ rating: -1 });

    const result = businesses.map(biz => {
      const obj = biz.toObject();
      const imageFields = buildBusinessImageFields(req, obj);

      return {
        ...obj,
        ...imageFields,
      };
    });

    const uniqueImageResult = ensureUniqueImageUrls(result);

    console.log('[getAllBusinesses] Query:', req.query, '| returned:', uniqueImageResult.length);
    console.log('[getAllBusinesses] imageUrl map:', uniqueImageResult.map((b) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl })));

    return res.json(uniqueImageResult);
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
    const imageFields = buildBusinessImageFields(req, obj);

    const payload = { ...obj, ...imageFields };
    console.log('[getBusinessById] imageUrl:', { id: payload.id, name: payload.name, imageUrl: payload.imageUrl });
    return res.json(payload);
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
      const imageFields = buildBusinessImageFields(req, obj);
      return { ...obj, ...imageFields };
    });

    const uniqueImageResult = ensureUniqueImageUrls(result);
    console.log('[getBusinessesByCategory] imageUrl map:', uniqueImageResult.map((b) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl })));

    return res.json(uniqueImageResult);
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
