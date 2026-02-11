import prisma from "../prisma/client.js";
import { getAcademicYear, isFebruary } from "../utils/academicYear.js";
import { autoPromoteIfEligible } from "./studentcontrollers.js";
/**
 * Academic Year Logic
 * Academic session = March → February
 * Example:
 *  - April 2024 → academicYear 2024
 *  - January 2025 → academicYear 2024
 */
const getCurrentAcademicYear = () => {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 2 = March
  return month >= 2 ? now.getFullYear() : now.getFullYear() - 1;
};

// ===============================
// CREATE PAYMENT (Student / Gateway)
// ===============================
export const makePayment = async (req, res) => {
  try {
    const { studentId, amount, month, status } = req.body;

    if (!studentId || !month || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const academicYear = getCurrentAcademicYear();

    // Prevent duplicate month payment in same academic year
    const existing = await prisma.payment.findFirst({
      where: {
        studentId: Number(studentId),
        month,
        academicYear,
        status: "paid",
      },
    });

    if (existing) {
      return res.status(400).json({ message: "This month already paid" });
    }

    const payment = await prisma.payment.create({
      data: {
        studentId: Number(studentId),
        amount,
        month,
        status: status || "paid",
        academicYear,
      },
    });

    res.json(payment);
  } catch (err) {
    console.error("makePayment error:", err);
    res.status(500).json({ error: "Payment failed" });
  }
};

// ===============================
// STUDENT: GET OWN PAYMENTS (CURRENT SESSION)
// ===============================
export const getMyPayments = async (req, res) => {
  try {
    if (req.userRole !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const academicYear = getCurrentAcademicYear();

    const payments = await prisma.payment.findMany({
      where: {
        studentId: req.user.id,
        academicYear,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(payments);
  } catch (err) {
    console.error("getMyPayments error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// ADMIN: GET ALL PAYMENTS (ALL YEARS)
// ===============================
export const getAllPayments = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const payments = await prisma.payment.findMany({
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(payments);
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// ADMIN: MARK CASH PAYMENT (CURRENT SESSION)
// ===============================


export const markPaid = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { studentId, month } = req.body;

    if (!studentId || !month) {
      return res.status(400).json({ message: "studentId and month required" });
    }

    const academicYear = getAcademicYear();

    // Prevent duplicate payment for same month & year
    const existing = await prisma.payment.findFirst({
      where: {
        studentId: Number(studentId),
        month,
        academicYear,
        status: "paid",
      },
    });

    if (existing) {
      return res.status(400).json({ message: "This month already paid" });
    }

    const appSettings = await prisma.appSettings.findUnique({
      where: { id: 1 },
    });

    if (!appSettings) {
      return res.status(500).json({ message: "App settings not found" });
    }

    // ✅ CREATE PAYMENT
    const payment = await prisma.payment.create({
      data: {
        studentId: Number(studentId),
        month,
        academicYear,
        amount: appSettings.monthlyFee,
        status: "paid",
      },
    });

    // 🔥 AUTO PROMOTION (ONLY IN FEBRUARY)
    if (isFebruary()) {
      await autoPromoteIfEligible(Number(studentId));
    }

    res.json({
      message: "Payment marked successfully",
      payment,
    });

  } catch (err) {
    console.error("markPaid error:", err);
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// ADMIN: TOTAL REVENUE (ALL YEARS)
// ===============================
export const getTotalRevenue = async (req, res) => {
  try {
    if (!req.user || req.userRole !== "admin") {
      return res.json({ totalRevenue: 0 });
    }

    const result = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "paid",
      },
    });

    res.json({
      totalRevenue: result._sum.amount ?? 0,
    });
  } catch (err) {
    console.error("Revenue error:", err);
    res.json({ totalRevenue: 0 });
  }
};

// ===============================
// ADMIN: SET MONTHLY FEE
// ===============================
export const setMonthlyFee = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { fee } = req.body;
    const numericFee = Number(fee);

    if (!numericFee || numericFee <= 0) {
      return res.status(400).json({ message: "Valid fee is required" });
    }

    await prisma.appSettings.upsert({
      where: { id: 1 },
      update: { monthlyFee: numericFee },
      create: { id: 1, monthlyFee: numericFee },
    });

    res.json({
      message: `Monthly fee updated to ₹${numericFee}.`,
    });
  } catch (err) {
    console.error("setMonthlyFee error:", err);
    res.status(500).json({ message: "Failed to update monthly fee" });
  }
};
