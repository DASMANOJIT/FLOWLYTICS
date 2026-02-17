import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma/client.js";
import cron from "node-cron";

// Import routes
import authRoutes from "./routes/authroute.js";
import studentRoutes from "./routes/studentroute.js";
import paymentRoutes from "./routes/paymentroute.js";
import settingsRoutes from "./routes/settingsroute.js";
import adminAssistantRoutes from "./routes/adminassistantroute.js";
import { autoPromoteIfEligible } from "./controllers/studentcontrollers.js";
import { runDailyFeeReminderJob } from "./services/reminderservice.js";

// Load .env variables
dotenv.config();

// Initialize app
const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middlewares
app.use(
  cors(
    corsOrigins.length
      ? {
          origin: corsOrigins,
          credentials: true,
        }
      : undefined
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/payments", paymentRoutes);
// ================================
// ENSURE APP SETTINGS EXISTS
// ================================
async function ensureAppSettings() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      await prisma.appSettings.create({
        data: { id: 1, monthlyFee: 600 },
      });
      console.log("✅ AppSettings initialized with ₹600");
    }
  } catch (err) {
    console.error("❌ Failed to init AppSettings:", err);
  }
}
ensureAppSettings();

// ================================
// CRON JOB: Promote all eligible students on 1st March every year
// ================================
cron.schedule("0 0 1 3 *", async () => {
  console.log("🔔 Running annual promotion check...");
  try {
    const targetAcademicYear = new Date().getFullYear() - 1;
    const students = await prisma.student.findMany();
    for (const s of students) {
      await autoPromoteIfEligible(s.id, targetAcademicYear);
    }
    console.log("✅ Promotion check completed.");
  } catch (err) {
    console.error("❌ Error during promotion cron:", err);
  }
});

// ================================
// CRON JOB: Daily WhatsApp fee reminders
// ================================
cron.schedule(
  process.env.REMINDER_CRON || "0 9 * * *",
  async () => {
    console.log("🔔 Running daily fee reminder job...");
    await runDailyFeeReminderJob();
  },
  {
    timezone: process.env.REMINDER_TIMEZONE || "Asia/Kolkata",
  }
);


// ================================
// Routes
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin-assistant", adminAssistantRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

export default app;
