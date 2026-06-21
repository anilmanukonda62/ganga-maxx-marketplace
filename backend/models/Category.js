const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
    // slug-style id, e.g. "cleaning-chemicals", auto-generated from name on create
  },
  name: { type: String, required: true },
  icon: { type: String, default: '📦' }, // emoji icon
  description: { type: String, required: true },
  displayOrder: { type: Number, default: 0 }, // for controlling display sequence
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
