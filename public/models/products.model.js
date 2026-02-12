/**
 * Products Model - Fetches product data from Firestore via API
 * Products are managed through the /admin dashboard
 */

const PRODUCTS_API = '/api/products';

/**
 * Fetches products from Firestore API
 * @returns {Promise<Array>} Array of product objects
 */
async function fetchProducts() {
  try {
    const response = await fetch(PRODUCTS_API);
    if (!response.ok) throw new Error('API response not ok');
    const data = await response.json();
    return data.products || [];
  } catch (err) {
    console.warn('Products fetch failed:', err.message);
    return [];
  }
}

window.fetchProducts = fetchProducts;
