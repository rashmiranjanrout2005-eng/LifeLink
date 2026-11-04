export const authorize = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role || req.user?.user_metadata?.role;
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient access' });
  }
  next();
};
