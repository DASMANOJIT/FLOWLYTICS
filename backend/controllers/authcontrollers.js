import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // ADMIN REGISTRATION
    // =========================
    if (role === "admin") {
      const exists = await prisma.admin.findUnique({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return res.json({ message: "Admin created", admin });
    }

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

      const token = jwt.sign(
        { id: admin.id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

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

    const token = jwt.sign(
      { id: student.id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ADMIN
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      await prisma.admin.update({
        where: { email },
        data: { password: hashedPassword },
      });
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

    return res.json({ message: "Student password reset successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
