const dns = require('dns');

// Fix for Node.js DNS resolution issues with MongoDB SRV on some Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  console.warn('Warning: Could not set custom DNS servers:', error.message);
}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

dotenv.config();

const products = [
  {
    "id": 1,
    "name": "Sanitizers (Alcohol/Herbal)",
    "category": "cleaning-chemicals",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781197344/Screenshot_2026-06-11_222907_qyqfyn.png",
    "stock": { "status": "in_stock" },
    "price": 189,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "100ml", "price": 89 },
      { "label": "250ml", "price": 129 },
      { "label": "500ml", "price": 189 }
    ],
    "description": "Hand and surface sanitizer in alcohol-based and herbal formulations. Kills bacteria and viruses instantly. Quick-drying without stickiness. Suitable for hands, equipment, and surfaces."
  },
  {
    "id": 2,
    "name": "Laundry Detergent (Powder/Liquid)",
    "category": "cleaning-chemicals",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781197344/Screenshot_2026-06-11_222928_e0j5se.png",
    "stock": { "status": "in_stock" },
    "price": 500,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Powder", "price": 450 },
      { "label": "Liquid", "price": 500 }
    ],
    "description": "Professional laundry detergent available in powder and liquid forms. Deep cleaning action removes stubborn stains. Available in multiple fragrances. Suitable for all washing machines."
  },
  {
    "id": 3,
    "name": "Disinfectants (Phenyl)",
    "category": "cleaning-chemicals",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781197340/Screenshot_2026-06-11_222945_uc4ewl.png",
    "stock": { "status": "in_stock" },
    "price": 149,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Phenyl", "price": 149 }
    ],
    "description": "Professional disinfectant available in traditional phenyl and eco-friendly variants. Kills 99.9% of germs and bacteria. Suitable for floors and general surfaces. Long-lasting protection."
  },
  {
    "id": 4,
    "name": "Air Fresheners (Spray, Gel, Automatic)",
    "category": "cleaning-chemicals",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781197344/Screenshot_2026-06-11_222959_o8duif.png",
    "stock": { "status": "low_stock", "count": 3 },
    "price": 40,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Rose", "price": 40 },
      { "label": "Jasmine Mist", "price": 40 },
      { "label": "Orchid", "price": 40 },
      { "label": "Room Spray", "price": 99 }
    ],
    "description": "Multiple air freshener formats including sprays, gels, and automatic dispensers. Eliminates odors and provides long-lasting fragrance. Available in various premium scents."
  },
  {
    "id": 5,
    "name": "Soap Oil - 5L",
    "category": "cleaning-chemicals",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781197345/Screenshot_2026-06-11_223016_scrrdj.png",
    "stock": { "status": "in_stock" },
    "price": 40,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "5L", "price": 40 }
    ],
    "description": "High-quality soap oil concentrate for mopping and floor cleaning. Gives a shiny, residue-free finish and a pleasant fragrance. Dilutes easily for cost-effective daily use and is suitable for all hard floor surfaces including tiles and marble."
  },
  {
    "id": 6,
    "name": "Microfiber Cloths",
    "category": "cleaning-tools-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199208/Screenshot_2026-06-11_230144_llsfbr.png",
    "stock": { "status": "in_stock" },
    "price": 35,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Pack of 3", "price": 35 },
      { "label": "Pack of 6", "price": 65 }
    ],
    "description": "Premium microfiber cloths ideal for dusting and polishing. Extremely absorbent and lint-free. Reusable and machine washable. Does not scratch delicate surfaces."
  },
  {
    "id": 7,
    "name": "Garbage Bins (Pedal/Manual)",
    "category": "cleaning-tools-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199193/Screenshot_2026-06-11_230102_vuf9yy.png",
    "stock": { "status": "in_stock" },
    "price": 140,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Pedal", "price": 140 },
      { "label": "Manual", "price": 120 }
    ],
    "description": "Commercial-grade garbage bins with hands-free pedal operation or manual lid. Stainless steel and plastic variants available. Large capacity for institutional use."
  },
  {
    "id": 8,
    "name": "Gloves (Rubber/Disposable)",
    "category": "cleaning-tools-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199197/Screenshot_2026-06-11_230114_dnomhq.png",
    "stock": { "status": "in_stock" },
    "price": 199,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Rubber (Pair)", "price": 99 },
      { "label": "Nitrile (100 Pack)", "price": 199 }
    ],
    "description": "Protective gloves for cleaning tasks available in reusable rubber and disposable nitrile options. Comfortable fit and excellent durability. Protects hands from chemicals."
  },
  {
    "id": 9,
    "name": "Masks & PPE Kits",
    "category": "cleaning-tools-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199198/Screenshot_2026-06-11_230123_e3gmtj.png",
    "stock": { "status": "out_of_stock" },
    "price": 120,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Masks (N95)", "price": 120 },
      { "label": "PPE Kit", "price": 450 }
    ],
    "description": "Personal protective equipment including masks, face shields, and safety gear. N95 and N99 variants available. Essential for industrial cleaning operations."
  },
  {
    "id": 10,
    "name": "Vacuum Cleaners (Wet & Dry)",
    "category": "mechanical-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199507/Screenshot_2026-06-11_230606_slkek2.png",
    "stock": { "status": "in_stock" },
    "price": 12999,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "20L", "price": 9999 },
      { "label": "30L", "price": 12999 },
      { "label": "50L", "price": 16999 }
    ],
    "description": "Industrial wet and dry vacuum cleaners for commercial use. Powerful suction for both dry debris and wet spills. Large capacity tanks and durable construction."
  },
  {
    "id": 11,
    "name": "Floor Scrubber Machines",
    "category": "mechanical-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199510/Screenshot_2026-06-11_230615_sdkqgv.png",
    "stock": { "status": "out_of_stock" },
    "price": 24999,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Single Disc", "price": 24999 },
      { "label": "Dual Disc", "price": 32999 }
    ],
    "description": "Automatic floor scrubbing machines for large area cleaning. Reduced labor and consistent cleaning results. Multiple brush configurations available for tiles, marble and industrial flooring."
  },
  {
    "id": 12,
    "name": "High Pressure Washer Trolley",
    "category": "mechanical-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199521/Screenshot_2026-06-11_230637_zcr3gg.png",
    "stock": { "status": "in_stock" },
    "price": 65000,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Trolley Mounted", "price": 65000 }
    ],
    "description": "Heavy-duty trolley-mounted high pressure washer with 5HP motor and pressure of more than 12 bar. Electric DC powered with automatic operation, ideal for deep cleaning of floors, vehicles, and exteriors in institutional setups. Comes with a 6-month warranty."
  },
  {
    "id": 13,
    "name": "Steam Cleaner",
    "category": "mechanical-equipment",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781199520/Screenshot_2026-06-11_230648_ghqwj0.png",
    "stock": { "status": "low_stock", "count": 4 },
    "price": 10999,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Standard", "price": 10999 }
    ],
    "description": "Powerful 1500W steam cleaner with 3.2 bar pressure for chemical-free cleaning. Removes 99.9% of viruses and bacteria using only water. Comes with multiple attachments for floors, tiles, and upholstery, making it ideal for institutional sanitization."
  },
  {
    "id": 14,
    "name": "Tissue Rolls (Jumbo/Toilet)",
    "category": "washroom-supplies",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198100/Screenshot_2026-06-11_224258_q7swxm.png",
    "stock": { "status": "in_stock" },
    "price": 25,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Toilet", "price": 25 },
      { "label": "Jumbo", "price": 199 }
    ],
    "description": "High-quality tissue rolls in standard toilet and jumbo dispenser formats. Soft and strong. Hygienic and economical. Suitable for commercial and institutional use."
  },
  {
    "id": 15,
    "name": "Paper Napkins",
    "category": "washroom-supplies",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198096/Screenshot_2026-06-11_224320_rlnniy.png",
    "stock": { "status": "in_stock" },
    "price": 25,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "2-Ply", "price": 25 },
      { "label": "3-Ply", "price": 35 }
    ],
    "description": "Premium paper napkins for dining and washroom use. Absorbent and durable. Available in multiple colors and ply options."
  },
  {
    "id": 16,
    "name": "Soap Dispensers",
    "category": "washroom-supplies",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198096/Screenshot_2026-06-11_224334_slhuu0.png",
    "stock": { "status": "low_stock", "count": 3 },
    "price": 55,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Wall-Mount", "price": 199 },
      { "label": "Countertop", "price": 55 }
    ],
    "description": "Wall-mounted and countertop soap dispensers for institutional use. Durable construction and reliable operation. Multiple mounting options available."
  },
  {
    "id": 17,
    "name": "Air Freshener Dispensers",
    "category": "washroom-supplies",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198099/Screenshot_2026-06-11_224347_ccqy7y.png",
    "stock": { "status": "in_stock" },
    "price": 199,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Automatic Spray", "price": 199 },
      { "label": "Refill Pack", "price": 99 }
    ],
    "description": "Automatic aerosol air freshener dispensers that release fragrance at programmed intervals, keeping washrooms fresh all day. Long-lasting refills available in multiple fragrances, ideal for institutional restrooms and common areas."
  },
  {
    "id": 18,
    "name": "Tissue Paper Dispenser",
    "category": "washroom-supplies",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198097/Screenshot_2026-06-11_224414_o8tqmp.png",
    "stock": { "status": "in_stock" },
    "price": 1749,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "Wall-Mounted", "price": 1749 }
    ],
    "description": "Multifold hand tissue paper dispenser with a sleek wall-mounted design. Easy single-sheet dispensing reduces wastage and keeps washrooms hygienic. Durable, easy-to-refill construction suitable for offices, hotels, and institutions."
  },
  {
    "id": 19,
    "name": "Swizydra Stainless Steel Cleaner",
    "category": "eco-friendly-products",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198479/Screenshot_2026-06-11_225035_qftrzs.png",
    "stock": { "status": "in_stock" },
    "price": 340,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "1L", "price": 340 },
      { "label": "5L", "price": 1459 }
    ],
    "description": "Specially formulated stainless steel cleaner that removes fingerprints, stains, and prevents smudges and streaks. Restores shine to kitchen equipment and steel surfaces. Eco-friendly, biodegradable formulation safe for daily institutional use."
  },
  {
    "id": 20,
    "name": "Swizydra Dishwash Liquid/Gel",
    "category": "eco-friendly-products",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198482/Screenshot_2026-06-11_224949_go0ngo.png",
    "stock": { "status": "in_stock" },
    "price": 1480,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "500ML", "price": 225 },
      { "label": "1L", "price": 344 },
      { "label": "5L", "price": 1480 }
    ],
    "description": "Powerful dishwashing liquid that cuts through grease and food residue. Available in liquid and gel formats. Gentle on hands while being tough on dishes. Economical usage for institutional kitchens."
  },
  {
    "id": 21,
    "name": "Swizydra Floor Cleaner",
    "category": "eco-friendly-products",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198482/Screenshot_2026-06-11_224856_vccdz5.png",
    "stock": { "status": "in_stock" },
    "price": 239,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "500ML", "price": 168 },
      { "label": "1L", "price": 239 },
      { "label": "5L", "price": 903 }
    ],
    "description": "Professional-grade floor cleaners available in multiple formulations including general purpose, perfumed varieties, and disinfectant solutions. Suitable for all floor types including tiles, marble, and linoleum. Removes dirt, stains, and bacteria effectively while leaving a fresh fragrance."
  },
  {
    "id": 22,
    "name": "Swizydra Multipurpose Cleaner",
    "category": "eco-friendly-products",
    "image": "https://res.cloudinary.com/dzncyz7bu/image/upload/v1781198483/Screenshot_2026-06-11_224930_tgf9re.png",
    "stock": { "status": "low_stock", "count": 5 },
    "price": 232,
    "priceLabel": "Price per unit",
    "variants": [
      { "label": "500ML", "price": 168 },
      { "label": "1L", "price": 232 },
      { "label": "5L", "price": 903 }
    ],
    "description": "Versatile all-in-one cleaner suitable for multiple surfaces including wood, laminate, stainless steel, and plastic. Can be used on walls, desks, cabinets, and more. Non-abrasive, biodegradable, and safe for all surfaces."
  }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing product records.');

    // Seed products
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products.`);

    // Check & Create Default Admin Account
    const defaultUsername = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@2026';

    const existingAdmin = await Admin.findOne({ username: defaultUsername });
    if (!existingAdmin) {
      await Admin.create({
        username: defaultUsername,
        password: defaultPassword,
        email: 'anilkumarmanukonda07@gmail.com'
      });
      console.log(`Successfully created default admin user: ${defaultUsername}`);
    } else {
      existingAdmin.email = 'anilkumarmanukonda07@gmail.com';
      await existingAdmin.save();
      console.log(`Admin user "${defaultUsername}" already exists. Updated email to: anilkumarmanukonda07@gmail.com`);
    }

    console.log('*** Database seeding completed successfully. ***');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
