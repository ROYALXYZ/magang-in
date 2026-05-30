export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // req.userRole di-set pada auth.middleware.js
    if (!req.userRole) {
      return res.status(401).json({ message: 'Peran pengguna tidak diketahui.' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ 
        message: `Akses ditolak! Fitur ini membutuhkan hak akses: ${allowedRoles.join(' atau ')}` 
      });
    }

    next();
  };
};
