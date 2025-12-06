import User from '../models/user-model.js';

const adminMiddleware = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // If role present in token, honor it
  if (user.role && user.role === 'admin') {
    return next();
  }

  // Otherwise, attempt to fetch user record from DB to check role
  try {
    const dbUser = await User.findById(user.id).select('role');
    if (dbUser && dbUser.role === 'admin') {
      // attach role into req.user for downstream use
      req.user.role = 'admin';
      return next();
    }
    return res.status(403).json({ message: 'Admin role required' });
  } catch (err) {
    console.error('adminMiddleware error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default adminMiddleware;
