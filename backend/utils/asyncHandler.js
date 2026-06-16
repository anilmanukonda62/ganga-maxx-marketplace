/**
 * Wraps async functions to ensure any errors are caught and forwarded to Express next() error handler.
 * @param {Function} fn - Async middleware or route handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
