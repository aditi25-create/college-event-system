import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        return next(new Error("User not found or account removed"));
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error("Not authorized: invalid or expired token"));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized: no token provided"));
  }
};

// Middleware to restrict access based on user role (e.g. "admin", "organizer")
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Access denied: role '${req.user?.role || "guest"}' is not authorized`)
      );
    }
    next();
  };
};
