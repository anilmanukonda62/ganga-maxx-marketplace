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
    console.error('BREVO_API_KEY environment variable is not defined.');
    throw new Error('BREVO_API_KEY environment variable is not defined.');
  }

  // Print first 10 characters and length for security debugging
  console.log(`[Brevo SMTP Debug] API Key prefix: "${apiKey.substring(0, 10)}...", Total Length: ${apiKey.length}`);

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
    payload.attachment = attachments.map(att => {
      let content = att.content;
      // Remove data URI prefix like "data:application/pdf;base64," if present
      if (content.includes(';base64,')) {
        content = content.split(';base64,')[1];
      }
      return {
        content: content,
        name: att.name
      };
    });

    // Console log right before sending
    payload.attachment.forEach(att => {
      console.log(`[Brevo SMTP Debug] PDF Attachment: "${att.name}", Base64 Content Length: ${att.content.length} characters`);
    });
  }

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error('[Brevo SMTP Debug] API response error data:', JSON.stringify(err.response.data));
      console.error('[Brevo SMTP Debug] API response error status:', err.response.status);
      throw new Error(`Brevo HTTP API Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else {
      console.error('[Brevo SMTP Debug] Request connection error:', err.message);
      throw new Error(`Brevo HTTP API Connection Error: ${err.message}`);
    }
  }
};

module.exports = sendEmailViaBrevo;
