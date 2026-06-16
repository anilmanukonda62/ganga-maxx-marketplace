import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://ganga-maxx-marketplace-ct25.onrender.com/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/products/categories`)
      ]);
      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to retrieve catalog data from server');
      }
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (err) {
      console.warn('API fetch failed, falling back to products.json:', err.message);
      setError(err.message);
      // Fallback to products.json if API fails
      const fallback = await import('../data/products.json');
      setProducts(fallback.products || []);
      setCategories(fallback.categories || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Retrieve all products
  const getAllProducts = () => products;

  // Retrieve all categories
  const getAllCategories = () => categories;

  // Get products by category ID
  const getProductsByCategory = (categoryId) => {
    if (!categoryId || categoryId === 'all') return products;
    return products.filter(p => p.category === categoryId);
  };

  // Get single product details by numeric/string ID
  const getProductById = (id) => {
    const numId = Number(id);
    return products.find(p => p.id === numId) || null;
  };

  // Get related products in the same category (excluding current)
  const getRelatedProducts = (product, limit = 4) => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  };

  // Search products by name and description
  const searchProducts = (query, productList = products) => {
    if (!query) return productList;
    const lowerQuery = query.toLowerCase().trim();
    return productList.filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  };

  // Calculate dynamic price ranges based on the dataset
  const getPriceRange = () => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map(p => {
      const hasMultipleVariants = p.variants && p.variants.length > 1;
      return hasMultipleVariants
        ? Math.min(...p.variants.map(v => v.price))
        : p.price;
    });
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  return {
    products,
    categories,
    logo: 'https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png',
    loading,
    error,
    getAllProducts,
    getAllCategories,
    getProductsByCategory,
    getProductById,
    getRelatedProducts,
    searchProducts,
    getPriceRange,
    retryFetch: fetchData
  };
};
