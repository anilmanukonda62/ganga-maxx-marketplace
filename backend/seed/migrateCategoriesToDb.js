const dns = require('dns');

// Fix for Node.js DNS resolution issues with MongoDB SRV on some Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  console.warn('Warning: Could not set custom DNS servers:', error.message);
}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');

dotenv.config();

const categories = [
  { id: 'cleaning-chemicals', name: 'Cleaning Chemicals', icon: '🧴', description: 'Professional cleaning chemicals and detergents', displayOrder: 1 },
  { id: 'cleaning-tools-equipment', name: 'Cleaning Tools & Equipment', icon: '🧹', description: 'Essential cleaning tools and equipment', displayOrder: 2 },
  { id: 'mechanical-equipment', name: 'Mechanical Equipment', icon: '⚙️', description: 'Industrial cleaning machines and equipment', displayOrder: 3 },
  { id: 'washroom-supplies', name: 'Washroom Supplies', icon: '🚻', description: 'Disposable washroom and restroom supplies', displayOrder: 4 },
  { id: 'eco-friendly-products', name: 'Eco-Friendly Products', icon: '🌿', description: 'Sustainable and eco-conscious cleaning solutions', displayOrder: 5 }
];

const migrate = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    let createdCount = 0;
    let existingCount = 0;

    for (const cat of categories) {
      const existing = await Category.findOne({ id: cat.id });
      if (!existing) {
        await Category.create(cat);
        console.log(`Successfully migrated new category: "${cat.name}" (ID: ${cat.id})`);
        createdCount++;
      } else {
        console.log(`Category "${cat.name}" already exists. Skipping.`);
        existingCount++;
      }
    }

    console.log(`\nMigration completed: ${createdCount} categories created, ${existingCount} already existed.`);
    process.exit(0);
  } catch (error) {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
};

migrate();
