export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userId || !req.userRole) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.userRole)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireSupport = requireRole('SUPPORT', 'ADMIN');
export const requireUser = requireRole('USER', 'SUPPORT', 'ADMIN');
