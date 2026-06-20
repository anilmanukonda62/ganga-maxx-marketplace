const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anilkumarmanukonda07@gmail.com',
    pass: 'kgipxhcsqqjhtsnn',
  },
});

const generateQuotationEmailHTML = (
  customerName,
  products,
  subtotal,
  taxPercent,
  taxAmount,
  grandTotal,
  validityDate,
  notes,
  discountType,
  discountValue,
  discountAmount,
  taxableAmount,
  cgstAmount,
  sgstAmount
) => {
  const formattedValidityDate = new Date(validityDate).toLocaleDateString('en-IN');
  
  const discAmt = discountAmount !== undefined ? discountAmount : 0;
  const hasDiscount = discAmt > 0;
  const discountLabel = discountType === 'percentage' ? `Bulk Discount (${discountValue}%):` : 'Bulk Discount:';
  const taxBase = taxableAmount !== undefined ? taxableAmount : (subtotal - discAmt);
  
  const productRows = products.map(p => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: left;">${p.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: left;">${p.variant || 'Default'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;">${p.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${p.unitPrice.toLocaleString('en-IN')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${p.lineTotal.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
        <img src="https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png" alt="Ganga Maxx Logo" style="max-height: 60px; margin-bottom: 10px; border-radius: 8px;" />
        <h2 style="color: #1a7a4c; margin: 0; font-size: 24px; font-weight: 800;">GANGA MAXX MARKETPLACE</h2>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; uppercase; tracking-wide;">B2B Supply Quotation</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">Dear <strong>${customerName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">Thank you for your enquiry. We are pleased to submit our commercial quotation for the requested catalog products:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px 10px; text-align: left; color: #475569; font-weight: 700;">Product</th>
            <th style="padding: 12px 10px; text-align: left; color: #475569; font-weight: 700;">Variant</th>
            <th style="padding: 12px 10px; text-align: center; color: #475569; font-weight: 700;">Qty</th>
            <th style="padding: 12px 10px; text-align: right; color: #475569; font-weight: 700;">Unit Price</th>
            <th style="padding: 12px 10px; text-align: right; color: #475569; font-weight: 700;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
      
      <table style="width: 280px; margin-left: auto; margin-bottom: 30px; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Subtotal:</td>
          <td style="text-align: right; font-weight: bold; padding: 4px 0;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        ${hasDiscount ? `
        <tr>
          <td style="color: #64748b; padding: 4px 0;">${discountLabel}</td>
          <td style="text-align: right; font-weight: bold; color: #dc2626; padding: 4px 0;">-₹${discAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Taxable Amount:</td>
          <td style="text-align: right; font-weight: bold; padding: 4px 0;">₹${taxBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="color: #64748b; padding: 4px 0;">CGST (${(taxPercent / 2)}%):</td>
          <td style="text-align: right; font-weight: bold; padding: 4px 0;">₹${((cgstAmount !== undefined ? cgstAmount : taxAmount / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">SGST (${(taxPercent / 2)}%):</td>
          <td style="text-align: right; font-weight: bold; padding: 4px 0;">₹${((sgstAmount !== undefined ? sgstAmount : taxAmount / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="border-top: 2px solid #1a7a4c;">
          <td style="color: #1a7a4c; font-weight: bold; padding: 10px 0 0 0; font-size: 16px;">Grand Total:</td>
          <td style="color: #1a7a4c; text-align: right; font-weight: bold; padding: 10px 0 0 0; font-size: 16px;">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #1a7a4c; border-radius: 8px; padding: 16px; margin-bottom: 30px; font-size: 13px; line-height: 1.6;">
        <div style="margin-bottom: 8px;"><strong>Quotation Validity:</strong> Valid until ${formattedValidityDate}</div>
        ${notes ? `<div><strong>Notes/Delivery Info:</strong> ${notes}</div>` : ''}
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.6;">
        <p style="margin: 0 0 6px 0; font-weight: bold; color: #1e293b;">Ganga Maxx Commercial Sales Desk</p>
        <p style="margin: 0 0 6px 0;">Sri Ram Nagar Colony, Puppalaguda, Hyderabad, 500089</p>
        <p style="margin: 0;">Phone: +91 9110306090 / +91 9110714545 | Email: Gangamaxxmarketplace@gmail.com</p>
      </div>
    </div>
  `;
};

module.exports = {
  transporter,
  generateQuotationEmailHTML,
};
