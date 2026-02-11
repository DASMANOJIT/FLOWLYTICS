import express from "express";
import {
  getMyPayments,
  getAllPayments,
  markPaid,
  getTotalRevenue,
} from "../controllers/paymentcontrollers.js";
import { protect, adminOnly } from "../middleware/authmiddleware.js";
import {
  initiatePhonePePayment,
  phonePeCallback,
  getPhonePePaymentStatus,
} from "../controllers/phonepecontroller.js";

const router = express.Router();

// STUDENT
router.get("/my", protect, getMyPayments);

// ADMIN
router.get("/all", protect, adminOnly, getAllPayments);
router.post("/mark-paid", protect, adminOnly, markPaid);
router.get("/revenue", protect, adminOnly, getTotalRevenue);

// PHONEPE
router.post("/phonepe/initiate", protect, initiatePhonePePayment);
router.post("/phonepe/callback", phonePeCallback);
router.get("/phonepe/status/:transactionId", protect, getPhonePePaymentStatus);

export default router;
