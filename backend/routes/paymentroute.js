import express from "express";
import {
  getMyPayments,
  getAllPayments,
} from "../controllers/paymentcontrollers.js";
import { protect } from "../middleware/authmiddleware.js";
import { markPaid } from "../controllers/paymentcontrollers.js";
import { getTotalRevenue } from "../controllers/paymentcontrollers.js";


const router = express.Router();

router.get("/my", protect, getMyPayments);     // student
router.get("/all", protect, getAllPayments);   // admin
router.post("/mark-paid", protect, markPaid);   // admin: mark cash payment
router.get("/revenue", protect, getTotalRevenue); // admin

export default router;
