const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

// Helper to generate a URL-safe slug from a category name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

/**
 * @desc    Get all active categories
 * @route   GET /api/categories
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Only return active categories sorted by displayOrder
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  })
);

/**
 * @desc    Get all categories (including inactive, for Admin UI list view)
 * @route   GET /api/categories/all
 * @access  Private (Admin only)
 */
router.get(
  '/all',
  protect,
  asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ displayOrder: 1 });
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  })
);

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { name, icon, description } = req.body;

    if (!name || !description) {
      res.status(400);
      throw new Error('Please provide name and description');
    }

    const generatedId = slugify(name);

    // Duplicate check
    const existing = await Category.findOne({ id: generatedId });
    if (existing) {
      res.status(400);
      throw new Error('Category already exists');
    }

    // Determine the next displayOrder (max current displayOrder + 1)
    const maxOrderCat = await Category.findOne({}).sort({ displayOrder: -1 });
    const nextOrder = maxOrderCat ? (maxOrderCat.displayOrder || 0) + 1 : 1;

    const newCategory = await Category.create({
      id: generatedId,
      name,
      icon: icon || '📦',
      description,
      displayOrder: nextOrder,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: newCategory,
    });
  })
);

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ id: req.params.id });

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    const { name, icon, description, displayOrder, isActive } = req.body;

    if (name) {
      category.name = name;
      // Note: we preserve the slug ID so we don't break existing products referencing this category ID
    }
    if (icon !== undefined) category.icon = icon;
    if (description !== undefined) category.description = description;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.json({
      success: true,
      data: updatedCategory,
    });
  })
);

/**
 * @desc    Toggle category active state
 * @route   PUT /api/categories/:id/toggle-active
 * @access  Private (Admin only)
 */
router.put(
  '/:id/toggle-active',
  protect,
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ id: req.params.id });

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    category.isActive = !category.isActive;
    const updatedCategory = await category.save();

    res.json({
      success: true,
      data: updatedCategory,
    });
  })
);

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ id: req.params.id });

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    // Safety check: verify no products are assigned to this category
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete category - ${productCount} products are still assigned to it. Please reassign or delete those products first.`
      );
    }

    await Category.deleteOne({ id: req.params.id });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  })
);

module.exports = router;
