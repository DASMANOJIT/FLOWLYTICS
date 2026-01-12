import express from "express";
import {
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/authcontrollers.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/reset-password", resetPassword);

export default router;
