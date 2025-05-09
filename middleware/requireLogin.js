export const requireLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
  };
  
  // Optional: Role-based middleware
  export const requireRole = (role) => {
    return (req, res, next) => {
      if (!req.isAuthenticated() || req.user.role !== role) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      next();
    };
  };