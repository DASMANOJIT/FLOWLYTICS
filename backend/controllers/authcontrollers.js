import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  addSession,
  clearUserSessions,
  getActiveSessionCount,
  removeSession,
} from "../utils/sessionStore.js";

const prisma = new PrismaClient();
const MAX_DEVICES_PER_ACCOUNT = 2;

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
    String(password || "")
  );

const isValidPhone = (phone) =>
  /^\+?\d{10,15}$/.test(String(phone || "").trim());

// =====================================================
// REGISTER (ADMIN / STUDENT)
// =====================================================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      school,
      class: studentClass,
      role,
    } = req.body;

    // =========================
    // ADMIN REGISTRATION
    // =========================
    if (role === "admin") {
      return res.status(403).json({
        message: "Admin self-registration is disabled. Contact system owner.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // STUDENT REGISTRATION
    // =========================
    const exists = await prisma.student.findFirst({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // 🔥 FETCH GLOBAL MONTHLY FEE
    const settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return res.status(500).json({ message: "App settings not found" });
    }

    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        school,
        class: studentClass,
        monthlyFee: settings.monthlyFee, // ✅ CORRECT SOURCE
      },
    });

    res.json({ message: "Student registered", student });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================
// LOGIN (ADMIN FIRST → STUDENT)
// =====================================================
// =====================================================
// LOGIN (ADMIN FIRST → STUDENT)
// =====================================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // =========================
    // ADMIN LOGIN
    // =========================
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      const currentActive = getActiveSessionCount("admin", admin.id);
      if (currentActive >= MAX_DEVICES_PER_ACCOUNT) {
        return res.status(403).json({
          message:
            "Login limit reached (2 devices). Logout from another device first.",
        });
      }

      const token = jwt.sign(
        { id: admin.id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      const decoded = jwt.decode(token);
      const expMs = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 86400000;
      addSession("admin", admin.id, token, expMs);

      return res.json({
        token,
        role: "admin",
        name: admin.name,
      });
    }

    // =========================
    // STUDENT LOGIN
    // =========================
    const student = await prisma.student.findFirst({ where: { email } });

    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const currentActive = getActiveSessionCount("student", student.id);
    if (currentActive >= MAX_DEVICES_PER_ACCOUNT) {
      return res.status(403).json({
        message:
          "Login limit reached (2 devices). Logout from another device first.",
      });
    }

    const token = jwt.sign(
      { id: student.id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const decoded = jwt.decode(token);
    const expMs = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 86400000;
    addSession("student", student.id, token, expMs);

    return res.json({
      token,
      role: "student",
      name: student.name,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// =====================================================
// RESET PASSWORD (ADMIN / STUDENT)
// =====================================================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ADMIN
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      await prisma.admin.update({
        where: { email },
        data: { password: hashedPassword },
      });
      clearUserSessions("admin", admin.id);
      return res.json({ message: "Admin password reset successful" });
    }

    // STUDENT
    const student = await prisma.student.findFirst({ where: { email } });
    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.student.update({
      where: { id: student.id },
      data: { password: hashedPassword },
    });
    clearUserSessions("student", student.id);

    return res.json({ message: "Student password reset successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================
// LOGOUT (ADMIN / STUDENT)
// =====================================================
export const logoutUser = async (req, res) => {
  try {
    if (!req.user || !req.userRole || !req.token) {
      return res.status(400).json({ message: "Invalid logout request" });
    }

    removeSession(req.userRole, req.user.id, req.token);
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
