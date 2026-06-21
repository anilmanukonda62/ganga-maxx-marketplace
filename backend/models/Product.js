const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, 'Product numeric id is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    stock: {
      status: {
        type: String,
        required: [true, 'Stock status is required'],
        enum: {
          values: ['in_stock', 'low_stock', 'out_of_stock'],
          message: '{VALUE} is not a valid stock status',
        },
        default: 'in_stock',
      },
      count: {
        type: Number,
      },
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    priceLabel: {
      type: String,
      default: 'Price per unit',
    },
    variants: [
      {
        label: {
          type: String,
          required: [true, 'Variant label is required'],
        },
        price: {
          type: Number,
          required: [true, 'Variant price is required'],
        },
      },
    ],
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
  },
  {
    timestamps: true,
    // Ensure toJSON includes the exact properties as in products.json
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
