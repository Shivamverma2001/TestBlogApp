import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const roleAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        message: "Unauthorized - No token provided",
        code: "NO_TOKEN"
      });
    }

    // Check if the token is in the correct format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token format",
        code: "INVALID_FORMAT"
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: "Unauthorized - No token provided",
        code: "NO_TOKEN"
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ 
          message: "Unauthorized - User not found",
          code: "USER_NOT_FOUND"
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ 
          message: "Forbidden - Admin privileges required",
          code: "ADMIN_REQUIRED"
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: "Unauthorized - Invalid token",
          code: "INVALID_TOKEN"
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "Unauthorized - Token expired",
          code: "TOKEN_EXPIRED"
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Role auth middleware error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
};
