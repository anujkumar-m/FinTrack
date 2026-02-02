const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT auth middleware with a development fallback user
module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  // In development, allow a fallback "demo" user when no token is provided
  if ((!authHeader || !authHeader.startsWith('Bearer ')) && process.env.NODE_ENV !== 'production') {
    try {
      let user = await User.findOne({ email: 'demo@fintrack.local' });
      if (!user) {
        user = await User.create({
          name: 'Demo User',
          email: 'demo@fintrack.local',
          password: 'demo', // not used for real auth
        });
      }
      req.user = { id: user.id };
      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Failed to create demo user' });
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    req.user = decoded.user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};


