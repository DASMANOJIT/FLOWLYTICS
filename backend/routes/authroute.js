import express from "express";
import {
  loginUser,
  registerUser,
  resetPassword,
  logoutUser,
} from "../controllers/authcontrollers.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logoutUser);

export default router;
