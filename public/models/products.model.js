/**
 * Products Model - Fetches product data from data source
 * Swap DATA_SOURCE to API URL later for production
 */

/* Swap to API URL for production: e.g. 'https://api.example.com/products' */
const PRODUCTS_DATA_SOURCE = '/data/products.json';

/**
 * Fetches products from data source (JSON file or API)
 * @returns {Promise<Array>} Array of product objects
 */
async function fetchProducts() {
  try {
    const response = await fetch(PRODUCTS_DATA_SOURCE);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.products || [];
  } catch (err) {
    console.warn('Products fetch failed, using fallback:', err.message);
    return getFallbackProducts();
  }
}

/** Fallback products when fetch fails */
function getFallbackProducts() {
  return [
    { id: 'prod-fallback-1', name: 'Dog Food', image: '/assets/images/dog.jpg', price: 1500, originalPrice: 1800, discount: 17, rating: 4.5, category: 'Food' },
    { id: 'prod-fallback-2', name: 'Pet Collar', image: '/assets/images/goat.jpg', price: 400, originalPrice: 450, discount: 11, rating: 4.2, category: 'Accessories' },
  ];
}

window.fetchProducts = fetchProducts;
