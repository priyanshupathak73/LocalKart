// Recommendation Algorithm
import businesses, { getBusinessById, getRelatedBusinesses } from '../data/businesses';

/**
 * Advanced recommendation system based on multiple factors
 * @param {string} businessId - Current business ID
 * @param {number} limit - Number of recommendations to return
 * @returns {Array} Recommended businesses
 */
export const getRecommendedBusinesses = (businessId, limit = 4) => {
  const currentBusiness = getBusinessById(businessId);
  if (!currentBusiness) return [];

  // Get all other businesses
  const candidates = businesses.filter(b => b.id !== businessId);

  // Score each candidate based on multiple factors
  const scored = candidates.map(candidate => {
    let score = 0;

    // Factor 1: Same category (40 points)
    if (candidate.category === currentBusiness.category) {
      score += 40;
    }

    // Factor 2: High rating (30 points)
    if (candidate.rating >= 4.5) {
      score += 30;
    }

    // Factor 3: Recent reviews (20 points)
    if (candidate.reviews >= 100) {
      score += 20;
    }

    // Factor 4: Similar services (20 points)
    const currentServices = currentBusiness.services.map(s => s.name.toLowerCase());
    const commonServices = candidate.services.filter(s =>
      currentServices.some(cs => cs.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(cs))
    ).length;
    
    if (commonServices > 0) {
      score += 20;
    }

    return { ...candidate, recommendationScore: score };
  });

  // Sort by score and return top recommendations
  return scored.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit);
};

/**
 * Get businesses similar to current one (same category)
 * @param {string} businessId - Current business ID
 * @param {number} limit - Number of similar businesses to return
 * @returns {Array} Similar businesses
 */
export const getSimilarBusinesses = (businessId, limit = 3) => {
  const related = getRelatedBusinesses(businessId, limit);
  return related;
};

/**
 * Personalized recommendations based on user behavior
 * @param {Array} viewedBusinessIds - Array of business IDs viewed by user
 * @param {number} limit - Number of recommendations
 * @returns {Array} Recommended businesses
 */
export const getPersonalizedRecommendations = (viewedBusinessIds = [], limit = 4) => {
  if (viewedBusinessIds.length === 0) {
    // Return top-rated businesses if no history
    return businesses
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Get categories from viewed businesses
  const viewedBusinesses = viewedBusinessIds
    .map(id => getBusinessById(id))
    .filter(b => b !== undefined);

  if (viewedBusinesses.length === 0) {
    return businesses.slice(0, limit);
  }

  // Get unique categories from viewed businesses
  const preferredCategories = [...new Set(viewedBusinesses.map(b => b.category))];

  // Score candidates based on preference
  const scored = businesses
    .filter(b => !viewedBusinessIds.includes(b.id))
    .map(candidate => {
      let score = 0;

      // Check if in preferred categories
      if (preferredCategories.includes(candidate.category)) {
        score += 50;
      }

      // Add rating bonus
      score += candidate.rating * 10;

      // Add review count bonus
      score += Math.min(candidate.reviews / 10, 20);

      return { ...candidate, score };
    });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};

/**
 * Trending businesses (high rating + recent engagement)
 * @param {number} limit - Number of trending businesses
 * @returns {Array} Trending businesses
 */
export const getTrendingBusinesses = (limit = 4) => {
  return businesses
    .sort((a, b) => {
      // Combined score: rating + review count normalized
      const scoreA = a.rating * 10 + Math.min(a.reviews / 20, 30);
      const scoreB = b.rating * 10 + Math.min(b.reviews / 20, 30);
      return scoreB - scoreA;
    })
    .slice(0, limit);
};

/**
 * Highly rated businesses in specific category
 * @param {string} category - Business category
 * @param {number} limit - Number of results
 * @returns {Array} Highly rated businesses
 */
export const getTopRatedByCategory = (category, limit = 3) => {
  return businesses
    .filter(b => b.category === category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

/**
 * Calculate recommendation relevance score
 * @param {Object} current - Current business
 * @param {Object} candidate - Candidate business
 * @returns {number} Relevance score (0-100)
 */
const calculateRelevanceScore = (current, candidate) => {
  let score = 0;

  // Category match
  if (current.category === candidate.category) score += 40;

  // Rating match (both high rated)
  if (current.rating >= 4.5 && candidate.rating >= 4.5) score += 20;

  // Review count (both popular)
  if (current.reviews >= 100 && candidate.reviews >= 100) score += 20;

  // Service overlap
  const currentServiceNames = current.services.map(s => s.name.toLowerCase());
  const candidateServiceNames = candidate.services.map(s => s.name.toLowerCase());
  const overlap = currentServiceNames.filter(s =>
    candidateServiceNames.some(cs => cs.includes(s) || s.includes(cs))
  ).length;

  if (overlap > 0) score += 20;

  return Math.min(score, 100);
};

export default {
  getRecommendedBusinesses,
  getSimilarBusinesses,
  getPersonalizedRecommendations,
  getTrendingBusinesses,
  getTopRatedByCategory,
};
