import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // If no Authorization header provided, treat request as unauthenticated
  // but allow the route to decide (some routes are public).
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Invalid token: respond with 401 so clients know token is bad
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}