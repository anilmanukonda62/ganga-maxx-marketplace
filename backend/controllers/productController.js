const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all products with filtering, search, and sorting
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, inStock, minPrice, maxPrice, sort } = req.query;

  const query = {};

  // Category filter
  if (category) {
    query.category = category;
  }

  // Search filter (searches name or description case-insensitive)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // In stock filter (filters out out_of_stock items)
  if (inStock === 'true') {
    query['stock.status'] = { $ne: 'out_of_stock' };
  }

  // Price range filters
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  // Sorting
  let sortBy = { id: 1 }; // Default sort by custom numeric id
  if (sort === 'price_asc') {
    sortBy = { price: 1 };
  } else if (sort === 'price_desc') {
    sortBy = { price: -1 };
  }

  const products = await Product.find(query).sort(sortBy);

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const activeCategories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
  res.json({
    success: true,
    data: activeCategories,
  });
});

/**
 * @desc    Get single product by custom numeric id
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const numericId = Number(req.params.id);

  if (isNaN(numericId)) {
    res.status(400);
    throw new Error('Product ID must be a valid number');
  }

  const product = await Product.findOne({ id: numericId });

  if (!product) {
    res.status(404);
    throw new Error(`Product not found with id ${numericId}`);
  }

  res.json({
    success: true,
    data: product,
  });
});

/**
 * @desc    Get related products (same category, excluding current product)
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
  const numericId = Number(req.params.id);

  if (isNaN(numericId)) {
    res.status(400);
    throw new Error('Product ID must be a valid number');
  }

  const product = await Product.findOne({ id: numericId });

  if (!product) {
    res.status(404);
    throw new Error(`Product not found with id ${numericId}`);
  }

  const limit = Number(req.query.limit) || 4;

  const related = await Product.find({
    category: product.category,
    id: { $ne: numericId },
  }).limit(limit);

  res.json({
    success: true,
    data: related,
  });
});

/**
 * @desc    Create a product (Admin only)
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const {
    id,
    name,
    category,
    image,
    stock,
    price,
    priceLabel,
    variants,
    description,
  } = req.body;

  // Generate or validate custom numeric id
  let finalId = id;
  if (!finalId) {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    finalId = lastProduct ? lastProduct.id + 1 : 1;
  } else {
    const existing = await Product.findOne({ id: finalId });
    if (existing) {
      res.status(400);
      throw new Error(`Product with custom numeric ID ${finalId} already exists`);
    }
  }

  const product = await Product.create({
    id: finalId,
    name,
    category,
    image,
    stock,
    price,
    priceLabel,
    variants,
    description,
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('productAdded', product);
  }

  res.status(201).json({
    success: true,
    data: product,
  });
});

/**
 * @desc    Update a product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = asyncHandler(async (req, res) => {
  const numericId = Number(req.params.id);

  if (isNaN(numericId)) {
    res.status(400);
    throw new Error('Product ID must be a valid number');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const product = await Product.findOne({ id: numericId });

  if (!product) {
    res.status(404);
    throw new Error(`Product not found with id ${numericId}`);
  }

  const {
    name,
    category,
    image,
    stock,
    price,
    priceLabel,
    variants,
    description,
  } = req.body;

  // Update fields
  if (name) product.name = name;
  if (category) product.category = category;
  if (image) product.image = image;
  if (stock) product.stock = { ...product.stock, ...stock };
  if (price !== undefined) product.price = price;
  if (priceLabel) product.priceLabel = priceLabel;
  if (variants) product.variants = variants;
  if (description) product.description = description;

  const updatedProduct = await product.save();

  const io = req.app.get('io');
  if (io) {
    io.emit('productUpdated', updatedProduct);
  }

  res.json({
    success: true,
    data: updatedProduct,
  });
});

/**
 * @desc    Delete a product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const numericId = Number(req.params.id);

  if (isNaN(numericId)) {
    res.status(400);
    throw new Error('Product ID must be a valid number');
  }

  const product = await Product.findOne({ id: numericId });

  if (!product) {
    res.status(404);
    throw new Error(`Product not found with id ${numericId}`);
  }

  await Product.deleteOne({ id: numericId });

  const io = req.app.get('io');
  if (io) {
    io.emit('productDeleted', { id: numericId });
  }

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
