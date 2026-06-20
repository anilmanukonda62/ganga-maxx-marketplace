const PDFDocument = require('pdfkit');
const axios = require('axios');

/**
 * Generate a premium corporate-style PDF quotation buffer.
 * @param {Object} enquiry - The enquiry object containing customer details
 * @param {Array} productsInput - List of products (optional, falls back to enquiry.products or finalQuotation.products)
 * @param {number} subtotalInput - Subtotal amount (optional)
 * @param {number} taxPercentInput - GST percentage (optional)
 * @param {number} taxAmountInput - GST amount (optional)
 * @param {number} grandTotalInput - Grand total amount (optional)
 * @param {string} validityDateInput - Validity date string (optional)
 * @param {string} notesInput - Notes/terms (optional)
 * @returns {Promise<Buffer>} - Resolves to the PDF buffer
 */
const generateQuotationPDF = (enquiry, productsInput, subtotalInput, taxPercentInput, taxAmountInput, grandTotalInput, validityDateInput, notesInput, discountTypeInput, discountValueInput, discountAmountInput, taxableAmountInput, cgstAmountInput, sgstAmountInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Resolve inputs with fallback for single object input or positional arguments
      const isSingleObj = enquiry && !enquiry._id && !enquiry.fullName && (enquiry.products || enquiry.grandTotal);
      const data = isSingleObj ? enquiry : {};
      
      const products = productsInput || data.products || (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.products) || [];
      const subtotal = subtotalInput !== undefined ? subtotalInput : (data.subtotal !== undefined ? data.subtotal : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.subtotal) || 0);
      const taxPercent = taxPercentInput !== undefined ? taxPercentInput : (data.gstRate !== undefined ? data.gstRate : (data.taxPercent !== undefined ? data.taxPercent : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.taxPercent) || 18));
      const taxAmount = taxAmountInput !== undefined ? taxAmountInput : (data.taxAmount !== undefined ? data.taxAmount : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.taxAmount) || 0);
      const grandTotal = grandTotalInput !== undefined ? grandTotalInput : (data.grandTotal !== undefined ? data.grandTotal : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.grandTotal) || 0);
      const validityDate = validityDateInput || data.validityDate || (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.validityDate) || new Date();
      const notes = notesInput !== undefined ? notesInput : (data.notes !== undefined ? data.notes : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.notes) || '');
      
      // Additional optional fields for complete compatibility
      const discountType = discountTypeInput !== undefined ? discountTypeInput : (data.discountType || (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.discountType) || 'percentage');
      const discountValue = discountValueInput !== undefined ? discountValueInput : (data.discountValue !== undefined ? data.discountValue : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.discountValue) || 0);
      const discountAmount = discountAmountInput !== undefined ? discountAmountInput : (data.discountAmount !== undefined ? data.discountAmount : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.discountAmount) || 0);
      
      const taxableAmount = taxableAmountInput !== undefined ? taxableAmountInput : (data.taxableAmount !== undefined ? data.taxableAmount : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.taxableAmount) || (subtotal - discountAmount));
      const cgstAmount = cgstAmountInput !== undefined ? cgstAmountInput : (data.cgstAmount !== undefined ? data.cgstAmount : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.cgstAmount) || (taxAmount / 2));
      const sgstAmount = sgstAmountInput !== undefined ? sgstAmountInput : (data.sgstAmount !== undefined ? data.sgstAmount : (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.sgstAmount) || (taxAmount / 2));
      
      const quotationNumber = data.quotationNumber || (enquiry && enquiry.finalQuotation && enquiry.finalQuotation.quotationNumber) || (enquiry && enquiry._id ? `GMX-QT-${enquiry._id.toString().substring(0, 8).toUpperCase()}` : `GMX-QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`);
      
      // Fetch logo buffer with timeout and try/catch safeguard
      let logoBuffer = null;
      try {
        const logoUrl = 'https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png';
        const response = await axios.get(logoUrl, { responseType: 'arraybuffer', timeout: 5000 });
        logoBuffer = Buffer.from(response.data, 'binary');
      } catch (logoErr) {
        console.warn('Failed to fetch company logo from Cloudinary:', logoErr.message);
      }

      // Helper: Format Currency (Indian format: lakh/crore commas, e.g. Rs. X,XX,XXX.XX)
      const formatCurrency = (amount) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
          return 'Rs. 0.00';
        }
        return 'Rs. ' + Number(amount).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      };

      // Helper: Format Date as e.g. "15 June 2026"
      const formatDateCustom = (dateVal) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      };

      // Helper: Draw Table Header Row (height 28pt)
      const drawTableHeader = (d, y) => {
        d.rect(50, y, 495, 28).fill('#16703F');
        
        d.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
        const textY = y + 9.5; // (28 - 9)/2 = 9.5pt vertical centering
        
        d.text('S.NO', 50, textY, { width: 30, align: 'center' });
        d.text('PRODUCT', 80, textY, { width: 180 });
        d.text('VARIANT', 260, textY, { width: 80 });
        d.text('QTY', 340, textY, { width: 50, align: 'center' });
        d.text('UNIT PRICE', 390, textY, { width: 70, align: 'right' });
        d.text('AMOUNT', 460, textY, { width: 85, align: 'right' });
      };

      // Helper: Draw Table Data Row (height 26pt)
      const drawDataRow = (d, y, idx, item) => {
        const isAvailable = item.available !== false;
        
        // Background fill
        let bgColor = '#FFFFFF';
        if (!isAvailable) {
          bgColor = '#FEF2F2';
        } else if (idx % 2 !== 0) { // odd rows in 0-indexed terms are filled gray
          bgColor = '#FAFAFA';
        }
        
        if (bgColor !== '#FFFFFF') {
          d.rect(50, y, 495, 26).fill(bgColor);
        }
        
        const textY = y + 8.5; // (26 - 9)/2 = 8.5pt vertical centering
        
        // S.No (centered, gray)
        d.font('Helvetica').fontSize(9).fillColor('#6B7280').text((idx + 1).toString(), 50, textY, { width: 30, align: 'center' });
        
        // Product Name + "(Unavailable)" badge if needed
        if (isAvailable) {
          d.font('Helvetica').fontSize(9).fillColor('#1A1A1A').text(item.productName || 'N/A', 80, textY, { width: 175, height: 16, ellipsis: true });
        } else {
          const nameText = item.productName || 'N/A';
          const nameWidth = d.font('Helvetica').fontSize(9).widthOfString(nameText);
          const badgeX = Math.min(80 + nameWidth + 5, 200);
          
          d.font('Helvetica').fontSize(9).fillColor('#1A1A1A').text(nameText, 80, textY, { width: 115, height: 16, ellipsis: true });
          d.font('Helvetica-Oblique').fontSize(7).fillColor('#DC2626').text('(Unavailable)', badgeX, textY + 1.5);
        }
        
        // Variant
        d.font('Helvetica').fontSize(9).fillColor('#1A1A1A').text(item.variant || 'Default', 260, textY, { width: 80, height: 16, ellipsis: true });
        
        // Qty (centered, 10pt bold primary green)
        d.font('Helvetica-Bold').fontSize(10).fillColor('#16703F').text(item.quantity.toString(), 340, textY - 0.5, { width: 50, align: 'center' });
        
        // Unit Price (medium gray text, formatted currency)
        d.font('Helvetica').fontSize(9).fillColor('#6B7280').text(formatCurrency(item.unitPrice), 390, textY, { width: 70, align: 'right' });
        
        // Amount (bold dark text, or '—' if unavailable)
        if (isAvailable) {
          d.font('Helvetica-Bold').fontSize(9).fillColor('#1A1A1A').text(formatCurrency(item.lineTotal), 460, textY, { width: 85, align: 'right' });
        } else {
          d.font('Helvetica-Bold').fontSize(9).fillColor('#DC2626').text('—', 460, textY, { width: 85, align: 'right' });
        }
        
        // Thin bottom border
        d.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, y + 26).lineTo(545, y + 26).stroke();
      };

      // Helper: Draw Footer on bottom of page (fixed position y: ~770 to 800)
      const drawFooter = (d) => {
        d.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, 760).lineTo(545, 760).stroke();
        
        d.font('Helvetica').fontSize(8).fillColor('#6B7280').text(
          'For order confirmation, please contact us at +91 9110306090 or reply to this email',
          50, 768, { align: 'center', width: 495 }
        );
        
        d.font('Helvetica-Bold').fontSize(9).fillColor('#16703F').text(
          'Thank you for choosing Ganga Maxx Marketplace',
          50, 780, { align: 'center', width: 495 }
        );
        
        d.font('Helvetica-Oblique').fontSize(7).fillColor('#9CA3AF').text(
          'This is a system-generated quotation document.',
          50, 793, { align: 'center', width: 495 }
        );
      };

      // Initialize Document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // 2. Draw Top Section (y: 50 to 160)
      // Logo (50x50pt at 50, 50)
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 50, 50, { width: 50, height: 50 });
        } catch (imgErr) {
          console.warn('Error embedding Cloudinary logo:', imgErr.message);
        }
      }
      
      // Logo Name / Text (x: 110, y: 60)
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#16703F').text('GANGA MAXX MARKETPLACE', 110, 60);
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('B2B Cleaning & Hygiene Supplies', 110, 84);
      
      // Address (y: 115)
      doc.font('Helvetica').fontSize(8).fillColor('#6B7280');
      doc.text('Sri Ram Nagar Colony, Puppalaguda, Hyderabad, Telangana 500089', 50, 115);
      doc.text('Phone: +91 9110306090, +91 9110714545', 50, 127);
      doc.text('Email: Gangamaxxmarketplace@gmail.com', 50, 139);
      
      // Right Side "QUOTATION" (y: 50)
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#1A1A1A').text('QUOTATION', 50, 50, { align: 'right', width: 495 });
      
      // Right Side key-value layout (y: 95)
      const rightLabelX = 350;
      const rightValX = 450;
      const rightLabelW = 90;
      const rightValW = 95;
      
      // Quotation No.
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('Quotation No.', rightLabelX, 95, { align: 'right', width: rightLabelW });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#1A1A1A').text(quotationNumber, rightValX, 95, { align: 'right', width: rightValW });
      
      // Date
      const quoteDate = enquiry && enquiry.createdAt ? enquiry.createdAt : new Date();
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('Date', rightLabelX, 110, { align: 'right', width: rightLabelW });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#1A1A1A').text(formatDateCustom(quoteDate), rightValX, 110, { align: 'right', width: rightValW });
      
      // Valid Until
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('Valid Until', rightLabelX, 125, { align: 'right', width: rightLabelW });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#B45309').text(formatDateCustom(validityDate), rightValX, 125, { align: 'right', width: rightValW });
      
      // Thin divider line at y: 165
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, 165).lineTo(545, 165).stroke();

      // 3. Draw Customer Details Section (y: 180 to 250)
      // Left Column (Billed To)
      const billedToY = 180;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B7280').text('BILLED TO', 50, billedToY);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1A1A1A').text(enquiry.fullName || 'Client Name', 50, billedToY + 14);
      doc.font('Helvetica').fontSize(10).fillColor('#1A1A1A').text(enquiry.companyName || 'Company Name', 50, billedToY + 30);
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text(`Phone: ${enquiry.phone || 'N/A'}`, 50, billedToY + 44);
      if (enquiry.email) {
        doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text(`Email: ${enquiry.email}`, 50, billedToY + 57);
      }
      
      // Right Column (Payment Summary)
      const paymentSummaryY = 180;
      const availableProducts = products.filter(p => p.available !== false);
      const N = availableProducts.length;
      const M = availableProducts.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B7280').text('PAYMENT SUMMARY', 320, paymentSummaryY);
      doc.font('Helvetica').fontSize(9).fillColor('#1A1A1A').text(`Total Items: ${N} products, ${M} units`, 320, paymentSummaryY + 14);
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('Amount Due:', 320, paymentSummaryY + 30);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#16703F').text(formatCurrency(grandTotal), 320, paymentSummaryY + 42);

      // 4. Products Table (starts around y: 270)
      let tableY = 270;
      drawTableHeader(doc, tableY);
      
      let currentY = tableY + 28;
      
      products.forEach((item, idx) => {
        // If drawing this row would exceed y: 700
        if (currentY + 26 > 700) {
          drawFooter(doc);
          doc.addPage();
          currentY = 50;
          drawTableHeader(doc, currentY);
          currentY += 28;
        }
        
        drawDataRow(doc, currentY, idx, item);
        currentY += 26;
      });
      
      // Draw bottom table border (1pt #E5E7EB) after the last row
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();

      // 5. Summary Section & Notes Section (same vertical region, starting ~20pt below table)
      currentY += 20;
      
      const hasDiscount = discountAmount > 0;
      const summaryHeight = hasDiscount ? 136 : 116;
      
      // Check if summary and notes fit on current page, else add page
      if (currentY + summaryHeight > 730) {
        drawFooter(doc);
        doc.addPage();
        currentY = 50;
      }
      
      // Draw Notes Section (left side: x: 50 to 280)
      let notesY = currentY;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B7280').text('NOTES', 50, notesY);
      notesY += 14;
      
      const defaultNotes = "Thank you for considering Ganga Maxx Marketplace for your institutional supply needs.";
      const displayNotes = notes || defaultNotes;
      doc.font('Helvetica').fontSize(8.5).fillColor('#6B7280').text(displayNotes, 50, notesY, {
        width: 230,
        lineGap: 2.5
      });
      
      // Draw Summary Box (right-aligned: x: 295 to 545, width: 250)
      const summaryX = 295;
      const summaryWidth = 250;
      const rightAlignX = 545;
      let sumY = currentY;
      
      const drawSummaryRow = (label, valStr) => {
        // Label
        doc.font('Helvetica').fontSize(9).fillColor('#1A1A1A').text(label, summaryX, sumY + 5.5);
        // Value
        doc.font('Helvetica').fontSize(9).fillColor('#1A1A1A').text(valStr, summaryX, sumY + 5.5, { align: 'right', width: summaryWidth });
        // Underline
        doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(summaryX, sumY + 20).lineTo(rightAlignX, sumY + 20).stroke();
        sumY += 20;
      };
      
      // Subtotal
      drawSummaryRow('Subtotal', formatCurrency(subtotal));
      
      // Bulk Discount
      if (hasDiscount) {
        const discountLabel = discountValue ? `Bulk Discount (${discountValue}%)` : 'Bulk Discount';
        drawSummaryRow(discountLabel, `-${formatCurrency(discountAmount)}`);
      }
      
      // Taxable Amount
      drawSummaryRow('Taxable Amount', formatCurrency(taxableAmount));
      
      // CGST
      const cgstPercent = taxPercent / 2;
      drawSummaryRow(`CGST (${cgstPercent}%)`, formatCurrency(cgstAmount));
      
      // SGST
      const sgstPercent = taxPercent / 2;
      drawSummaryRow(`SGST (${sgstPercent}%)`, formatCurrency(sgstAmount));
      
      // Grand Total Row (height 36pt, filled #16703F, rounded corners if possible)
      try {
        doc.roundedRect(summaryX, sumY, summaryWidth, 36, 4).fill('#16703F');
      } catch (rectErr) {
        doc.rect(summaryX, sumY, summaryWidth, 36).fill('#16703F');
      }
      
      // Grand Total label
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('GRAND TOTAL', summaryX + 15, sumY + 13.5);
      
      // Grand Total amount
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#FFFFFF').text(formatCurrency(grandTotal), summaryX, sumY + 10, { align: 'right', width: summaryWidth - 15 });
      
      // Draw footer for the last page
      drawFooter(doc);
      
      // End document
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateQuotationPDF;
