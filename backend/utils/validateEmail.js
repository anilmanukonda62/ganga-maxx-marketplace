const dns = require('dns').promises;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

async function validateEmailExists(email) {
  // Step 1: Format check
  if (!email || !EMAIL_REGEX.test(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  // Step 2: Domain MX record check
  const domain = email.split('@')[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'Email domain cannot receive emails' };
    }
    return { valid: true };
  } catch (err) {
    // ENOTFOUND or ENODATA means domain doesn't exist or has no mail server
    return { valid: false, reason: 'Email domain does not exist' };
  }
}

module.exports = { validateEmailExists, EMAIL_REGEX };
