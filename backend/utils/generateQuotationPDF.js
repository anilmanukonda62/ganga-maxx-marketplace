const PDFDocument = require('pdfkit');

/**
 * Generate a PDF quotation buffer.
 * @param {Object} enquiry - The enquiry object
 * @param {Array} products - List of products
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxPercent - GST percentage
 * @param {number} taxAmount - GST amount
 * @param {number} grandTotal - Grand total amount
 * @param {string} validityDate - Validity date string
 * @param {string} notes - Notes/terms
 * @returns {Promise<Buffer>} - Resolves to the PDF buffer
 */
const generateQuotationPDF = (enquiry, products, subtotal, taxPercent, taxAmount, grandTotal, validityDate, notes) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header Banner
      doc.fillColor('#1a7a4c').rect(0, 0, 612, 40).fill();
      doc.fillColor('#ffffff').fontSize(14).text('GANGA MAXX MARKETPLACE - B2B SUPPLY PROPOSAL', 50, 14, { align: 'center' });

      // Title
      doc.fillColor('#1e293b').fontSize(20).text('COMMERCIAL QUOTATION', 50, 60, { align: 'left', font: 'Helvetica-Bold' });
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 450, 68, { align: 'right' });
      
      // Divider
      doc.moveTo(50, 90).lineTo(562, 90).strokeColor('#e2e8f0').stroke();

      // Client Details
      doc.fillColor('#64748b').fontSize(8).text('QUOTATION FOR:', 50, 105);
      doc.fillColor('#1e293b').fontSize(12).text(enquiry.fullName || 'Client Name', 50, 115, { font: 'Helvetica-Bold' });
      doc.fontSize(10).text(enquiry.companyName || 'Company Name', 50, 130);
      doc.fontSize(10).text(`Phone: ${enquiry.phone}`, 50, 145);
      if (enquiry.email) doc.fontSize(10).text(`Email: ${enquiry.email}`, 50, 160);

      // Quote details
      doc.fillColor('#64748b').fontSize(8).text('QUOTATION DETAILS:', 350, 105);
      doc.fillColor('#1e293b').fontSize(10).text(`Quote ID: GMX-QT-${enquiry._id.toString().substring(0, 8).toUpperCase()}`, 350, 115);
      doc.fontSize(10).text(`Validity: Until ${new Date(validityDate).toLocaleDateString('en-IN')}`, 350, 130);

      // Table Header
      let y = 190;
      doc.fillColor('#f8fafc').rect(50, y, 512, 20).fill();
      doc.fillColor('#475569').fontSize(9).text('Item Description', 60, y + 6, { font: 'Helvetica-Bold' });
      doc.text('Variant', 260, y + 6);
      doc.text('Qty', 380, y + 6, { width: 40, align: 'center' });
      doc.text('Unit Price (INR)', 430, y + 6, { width: 60, align: 'right' });
      doc.text('Total (INR)', 500, y + 6, { width: 55, align: 'right' });

      // Table Rows
      doc.fillColor('#1e293b');
      y += 20;
      products.forEach((p) => {
        if (!p.available) return; // Skip unavailable items
        doc.fontSize(9).text(p.productName, 60, y + 6);
        doc.fontSize(9).text(p.variant || 'Default', 260, y + 6);
        doc.fontSize(9).text(p.quantity.toString(), 380, y + 6, { width: 40, align: 'center' });
        doc.fontSize(9).text(`Rs ${p.unitPrice.toLocaleString('en-IN')}`, 430, y + 6, { width: 60, align: 'right' });
        doc.fontSize(9).text(`Rs ${p.lineTotal.toLocaleString('en-IN')}`, 500, y + 6, { width: 55, align: 'right' });
        
        doc.moveTo(50, y + 20).lineTo(562, y + 20).strokeColor('#f1f5f9').stroke();
        y += 20;
      });

      y += 10;
      // Calculations Summary
      doc.fontSize(10).text('Subtotal:', 350, y);
      doc.text(`Rs ${subtotal.toLocaleString('en-IN')}`, 470, y, { width: 90, align: 'right' });
      
      y += 15;
      doc.fontSize(10).text(`GST (${taxPercent}%):`, 350, y);
      doc.text(`Rs ${taxAmount.toLocaleString('en-IN')}`, 470, y, { width: 90, align: 'right' });

      y += 20;
      doc.fillColor('#1a7a4c').fontSize(12).text('Grand Total:', 350, y, { font: 'Helvetica-Bold' });
      doc.text(`Rs ${grandTotal.toLocaleString('en-IN')}`, 470, y, { width: 90, align: 'right', font: 'Helvetica-Bold' });

      // Terms/Notes
      y += 40;
      if (notes) {
        doc.fillColor('#64748b').fontSize(8).text('NOTES / TERMS:', 50, y);
        doc.fillColor('#475569').fontSize(9).text(notes, 50, y + 10, { width: 512, lineGap: 2 });
      }

      // Footer
      doc.fillColor('#64748b').fontSize(8).text('Thank you for your business. For invoice adjustments or billing enquiries, contact our Hyderabad office.', 50, 720, { align: 'center' });
      doc.text('Sri Ram Nagar Colony, Puppalaguda, Hyderabad, 500089 | Gangamaxxmarketplace@gmail.com', 50, 735, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateQuotationPDF;
