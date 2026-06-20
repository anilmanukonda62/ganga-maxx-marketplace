const fs = require('fs');
const path = require('path');
const generateQuotationPDF = require('./utils/generateQuotationPDF');

// Mock data
const mockEnquiry = {
  _id: '648f57291a1e05001c238b72',
  fullName: 'Anil Manukonda',
  companyName: 'Ganga Maxx Industries Pvt Ltd',
  phone: '+91 9876543210',
  email: 'anil.manukonda@example.com',
  createdAt: new Date('2026-06-15T12:00:00.000Z')
};

// 2 Products
const products2 = [
  { productName: 'Eco Cleaning Liquid', variant: '5 Litres Can', quantity: 2, unitPrice: 450.00, lineTotal: 900.00, available: true },
  { productName: 'Premium Floor Broom', variant: 'Hard Bristle', quantity: 5, unitPrice: 180.00, lineTotal: 900.00, available: true }
];

// 8 Products
const products8 = [
  { productName: 'Eco Cleaning Liquid', variant: '5 Litres Can', quantity: 2, unitPrice: 450.00, lineTotal: 900.00, available: true },
  { productName: 'Premium Floor Broom', variant: 'Hard Bristle', quantity: 5, unitPrice: 180.00, lineTotal: 900.00, available: true },
  { productName: 'Microfiber Mop Cloth', variant: 'Large (Blue)', quantity: 10, unitPrice: 120.00, lineTotal: 1200.00, available: true },
  { productName: 'Glass Cleaner Spray', variant: '500ml Bottle', quantity: 8, unitPrice: 95.00, lineTotal: 760.00, available: true },
  { productName: 'Hand Sanitizer Gel', variant: '1 Litre Pump', quantity: 4, unitPrice: 250.00, lineTotal: 1000.00, available: true },
  { productName: 'Liquid Soap Dispenser', variant: 'Wall Mount Chrome', quantity: 3, unitPrice: 650.00, lineTotal: 1950.00, available: true },
  { productName: 'Disinfectant Wipes', variant: 'Pack of 80', quantity: 12, unitPrice: 150.00, lineTotal: 1800.00, available: false }, // Unavailable
  { productName: 'Multipurpose Spray Bottle', variant: 'Adjustable Nozzle', quantity: 6, unitPrice: 85.00, lineTotal: 510.00, available: true }
];

// 18 Products to test pagination
const products18 = [];
for (let i = 1; i <= 18; i++) {
  products18.push({
    productName: `Clean Pro Supply Item #${i}`,
    variant: `Standard Pack`,
    quantity: i,
    unitPrice: 100.00 + i * 5,
    lineTotal: i * (100.00 + i * 5),
    available: i !== 12 // Item 12 is unavailable
  });
}

const runTest = async () => {
  console.log('Starting PDF Generation Tests...');
  
  const scenarios = [
    { name: '2_products', products: products2 },
    { name: '8_products', products: products8 },
    { name: '18_products', products: products18 }
  ];

  for (const s of scenarios) {
    // Filter available items for total calculations
    const availableItems = s.products.filter(p => p.available !== false);
    const subtotal = availableItems.reduce((sum, p) => sum + p.lineTotal, 0);
    const taxPercent = 18;
    const taxAmount = (subtotal * taxPercent) / 100;
    const grandTotal = subtotal + taxAmount;
    const validityDate = new Date('2026-06-22T00:00:00.000Z');
    const notes = 'Thank you for choosing Ganga Maxx Marketplace. Standard B2B commercial terms apply.';
    
    try {
      console.log(`Generating PDF for ${s.name}...`);
      const buffer = await generateQuotationPDF(
        mockEnquiry,
        s.products,
        subtotal,
        taxPercent,
        taxAmount,
        grandTotal,
        validityDate,
        notes
      );
      
      const filePath = path.join(__dirname, `test-quote-${s.name}.pdf`);
      fs.writeFileSync(filePath, buffer);
      console.log(`Success! Saved to ${filePath}`);
    } catch (err) {
      console.error(`Failed generating PDF for ${s.name}:`, err);
    }
  }
  
  console.log('All tests completed.');
};

runTest();
