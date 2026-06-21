const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProducts,
  getCategories,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim(),
  body('image').notEmpty().withMessage('Product image URL is required').isURL().withMessage('Image must be a valid URL'),
  body('price').isNumeric().withMessage('Price must be a number').custom(val => val >= 0).withMessage('Price cannot be negative'),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('stock.status')
    .optional()
    .isIn(['in_stock', 'low_stock', 'out_of_stock'])
    .withMessage('Invalid stock status'),
  body('stock.count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer'),
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array of objects'),
  body('variants.*.label')
    .optional()
    .notEmpty()
    .withMessage('Variant label is required'),
  body('variants.*.price')
    .optional()
    .isNumeric()
    .withMessage('Variant price must be a number'),
];

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

// Admin-only endpoints
router.post('/', protect, validateProduct, createProduct);
router.put('/:id', protect, validateProduct, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
