import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

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
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 CHECK ADMIN FIRST
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (admin) {
      req.user = {
        id: admin.id,
        role: "admin",
      };
      return next();
    }

    // 🔥 CHECK STUDENT
    const student = await prisma.student.findUnique({
      where: { id: decoded.id },
    });

    if (student) {
      req.user = {
        id: student.id,
        role: "student",
      };
      return next();
    }

    return res.status(401).json({ message: "User not found" });

  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ message: "Token invalid" });
  }
};
