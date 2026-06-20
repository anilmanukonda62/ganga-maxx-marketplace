const axios = require('axios');

/**
 * Send an email via Brevo's HTTP API.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - Email HTML body
 * @param {Array} [options.attachments] - Array of attachments in format { content (base64), name }
 * @returns {Promise<Object>} - Brevo API response data
 */
const sendEmailViaBrevo = async ({ to, subject, htmlContent, attachments }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not defined.');
  }

  const payload = {
    sender: {
      name: 'Ganga Maxx Marketplace',
      email: 'anilkumarmanukonda07@gmail.com',
    },
    to: [
      {
        email: to,
      },
    ],
    subject: subject,
    htmlContent: htmlContent,
  };

  if (attachments && attachments.length > 0) {
    payload.attachment = attachments;
  }

  const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

module.exports = sendEmailViaBrevo;
