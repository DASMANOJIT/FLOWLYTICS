import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getAcademicYear, isFebruary } from "../utils/academicYear.js";

const prisma = new PrismaClient();

// =======================
// ADMIN: GET ALL STUDENTS (WITH PAYMENT STATUS)
// =======================
export const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { payments: { orderBy: { createdAt: "desc" } } },
    });

    const enhanced = students.map((s) => {
      const paidPayments = s.payments.filter((p) => p.status === "paid");
      const latestPayment = paidPayments[0] || null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        school: s.school,
        class: s.class,
        monthlyFee: s.monthlyFee,
        payments: paidPayments.map((p) => ({
          id: p.id,
          amount: p.amount,
          month: p.month,
          date: p.createdAt,
          status: p.status,
        })),
        paidMonths: paidPayments.map((p) => p.month),
        latestPaymentMonth: latestPayment ? latestPayment.month : null,
        feesStatus: latestPayment ? "paid" : "unpaid",
        revenue: paidPayments.reduce((sum, p) => sum + p.amount, 0),
      };
    });

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// STUDENT: OWN PROFILE (GET)
// =======================
export const getLoggedInStudent = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const studentId = Number(req.user.id);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { payments: { orderBy: { createdAt: "desc" } } },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// ❌ REMOVE MANUAL PROFILE UPDATE
// Student cannot update class/school manually
// =======================
// export const updateLoggedInStudent = async (req, res) => { ... }  
// removed to prevent manual class update

// =======================
// GET STUDENT BY ID
// =======================
export const getStudentById = async (req, res) => {
  try {
    const studentId = Number(req.params.id);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { payments: { orderBy: { createdAt: "desc" } } },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// ADMIN: DELETE STUDENT
// =======================
export const deleteStudent = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const studentId = Number(req.params.id);

    await prisma.payment.deleteMany({ where: { studentId } });
    await prisma.student.delete({ where: { id: studentId } });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const autoPromoteIfEligible = async (studentId) => {
  if (!isFebruary()) return;

  const academicYear = getAcademicYear();

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { payments: true },
  });

  if (!student) return;

  const paidMonths = student.payments
    .filter(
      (p) =>
        p.status === "paid" &&
        p.academicYear === academicYear &&
        p.month
    )
    .map((p) => p.month);

  const uniqueMonths = [...new Set(paidMonths)];

  if (uniqueMonths.length !== 12) return;

  const currentClassNum = parseInt(student.class, 10);
  if (isNaN(currentClassNum)) return;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      class: String(currentClassNum + 1),
    },
  });

  console.log(
    `✅ Auto-promoted ${student.name} for academic year ${academicYear}`
  );
};



