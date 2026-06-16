/**
 * Format ISO Date String to user friendly format (e.g. "14 Jun 2026, 10:30 AM")
 * @param {string} dateString 
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // Format to standard Indian date/time layout
  const day = date.getDate();
  const months = ['Jun', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Wait, let's write a standard dynamic formatter
  const formattedMonth = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${day} ${formattedMonth} ${year}, ${hours}:${minutes} ${ampm}`;
};

/**
 * Format price in Rupees
 * @param {number} price 
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Convert an array of objects to CSV and trigger download in browser
 * @param {Array<Object>} data 
 * @param {string} filename 
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  // Get all unique headers from array elements
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      let cell = row[header] !== undefined && row[header] !== null ? row[header] : '';
      if (typeof cell === 'object') {
        cell = JSON.stringify(cell);
      }
      // Escape double quotes inside the text
      const escaped = ('' + cell).replace(/"/g, '""');
      // Wrap cell in double quotes if it contains separator, quotes or newlines
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
        return `"${escaped}"`;
      }
      return escaped;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
