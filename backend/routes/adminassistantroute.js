import express from "express";
import { protect, adminOnly } from "../middleware/authmiddleware.js";
import { adminAssistantChat } from "../controllers/adminassistantcontroller.js";

const router = express.Router();

router.post("/chat", protect, adminOnly, adminAssistantChat);

export default router;
