import express from "express";
import {
  getStudents,
  getLoggedInStudent,
  getStudentById,
  deleteStudent,
} from "../controllers/studentcontrollers.js";
import { protect, adminOnly } from "../middleware/authmiddleware.js";

const router = express.Router();

// ADMIN
router.get("/", protect, adminOnly, getStudents);
// STUDENT SELF
router.get("/me", protect, getLoggedInStudent);
router.get("/:id", protect, adminOnly, getStudentById);
router.delete("/:id", protect, adminOnly, deleteStudent);


export default router;
