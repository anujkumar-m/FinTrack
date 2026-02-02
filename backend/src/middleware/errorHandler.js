// Generic error handling middleware
// Ensure we always send a clean JSON error response
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err.stack || err);

  const status = err.statusCode || 500;
  const message = err.message || 'Server error';

  res.status(status).json({
    message,
  });
}

module.exports = errorHandler;

