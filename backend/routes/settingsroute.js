import express from "express";
import { setMonthlyFee } from "../controllers/settingscontrollers.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/monthly-fee", protect, setMonthlyFee);

export default router;
