// Filter and Search Logic
const toLower = (value) => String(value ?? '').toLowerCase();

/**
 * Advanced filtering function combining category and search
 * @param {Array} businesses - Array of business objects
 * @param {string} searchQuery - Search query string
 * @param {string} selectedCategory - Selected category filter
 * @returns {Array} Filtered businesses array
 */
export const filterBusinesses = (businesses, searchQuery = '', selectedCategory = 'All') => {
  let filtered = Array.isArray(businesses) ? businesses : [];
  const normalizedCategory = String(selectedCategory ?? 'All').trim().toLowerCase();
  const normalizedQuery = String(searchQuery ?? '').trim().toLowerCase();

  // Apply category filter
  if (normalizedCategory && normalizedCategory !== 'all') {
    filtered = filtered.filter((business) => {
      const businessCategory = toLower(business.category || business.type);
      return businessCategory === normalizedCategory;
    });
  }

  // Apply search filter
  if (normalizedQuery) {
    filtered = filtered.filter(
      (business) => {
        const services = Array.isArray(business.services) ? business.services : [];

        return (
          toLower(business.name).includes(normalizedQuery) ||
          toLower(business.category || business.type).includes(normalizedQuery) ||
          toLower(business.description).includes(normalizedQuery) ||
          toLower(business.tagline).includes(normalizedQuery) ||
          toLower(business.address).includes(normalizedQuery) ||
          services.some((service) =>
            toLower(service.name || service.title).includes(normalizedQuery) ||
            toLower(service.description).includes(normalizedQuery)
          )
        );
      }
    );
  }

  return filtered;
};

/**
 * Sort businesses by different criteria
 * @param {Array} businesses - Array of business objects
 * @param {string} sortBy - Sort criteria: 'rating', 'name', 'reviews'
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted businesses array
 */
export const sortBusinesses = (businesses, sortBy = 'rating', order = 'desc') => {
  const sorted = [...businesses];

  switch (sortBy) {
    case 'rating':
      sorted.sort((a, b) => (order === 'desc' ? b.rating - a.rating : a.rating - b.rating));
      break;
    case 'name':
      sorted.sort((a, b) => {
        const nameCompare = a.name.localeCompare(b.name);
        return order === 'desc' ? -nameCompare : nameCompare;
      });
      break;
    case 'reviews':
      sorted.sort((a, b) => (order === 'desc' ? b.reviews - a.reviews : a.reviews - b.reviews));
      break;
    default:
      return sorted;
  }

  return sorted;
};

/**
 * Get statistics for filtered businesses
 * @param {Array} businesses - Array of business objects
 * @returns {Object} Statistics object
 */
export const getBusinessesStats = (businesses) => {
  if (businesses.length === 0) {
    return {
      total: 0,
      avgRating: 0,
      totalReviews: 0,
      categories: [],
    };
  }

  const categories = [...new Set(businesses.map(b => b.category))];
  const avgRating =
    businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length;
  const totalReviews = businesses.reduce((sum, b) => sum + b.reviews, 0);

  return {
    total: businesses.length,
    avgRating: avgRating.toFixed(1),
    totalReviews,
    categories,
  };
};

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} query - Query to highlight
 * @returns {string} Text with highlighted terms
 */
export const highlightSearchTerm = (text, query) => {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export default {
  filterBusinesses,
  sortBusinesses,
  getBusinessesStats,
  highlightSearchTerm,
};
