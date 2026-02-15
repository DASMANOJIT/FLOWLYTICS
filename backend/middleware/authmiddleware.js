import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  isSessionActive,
} from "../utils/sessionStore.js";

const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    let user = null;
    if (decoded.role === "admin") {
      user = await prisma.admin.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "student") {
      user = await prisma.student.findUnique({ where: { id: decoded.id } });
    }

    if (!user) {
      return res.status(401).json({ message: "Not authorized, invalid user" });
    }

    if (!isSessionActive(decoded.role, decoded.id, token)) {
      return res
        .status(401)
        .json({ message: "Session expired or logged out. Please login again." });
    }

    // Attach user to request
    req.user = user;
    req.userRole = decoded.role;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};









export const adminOnly = (req, res, next) => {
  if (!req.user || req.userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};
