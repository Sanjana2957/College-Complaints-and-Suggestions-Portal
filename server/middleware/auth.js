const jwt = require("jsonwebtoken");

function requireLogin(req, res, next) {
  const token = req.cookies.portalToken;
  if (!token) return res.status(401).json({ message: "Please log in first." });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ message: "You are not allowed to perform this action." });
    next();
  };
}

module.exports = { requireLogin, requireRole };
