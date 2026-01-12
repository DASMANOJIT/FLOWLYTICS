import express from "express";
import {
  getStudents,
  getLoggedInStudent,
  getStudentById,
  deleteStudent,
  
} from "../controllers/studentcontrollers.js";
import { protect } from "../middleware/authmiddleware.js";
import prisma from "../prisma/client.js";

const router = express.Router();

router.get("/", protect, getStudents);
router.get("/me", protect, getLoggedInStudent);
router.get("/:id", protect, getStudentById);
router.delete("/:id", protect, deleteStudent);




export default router;
