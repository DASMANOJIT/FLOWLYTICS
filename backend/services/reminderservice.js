import prisma from "../prisma/client.js";
import { getAcademicYear } from "../utils/academicYear.js";
import {
  getDueMonthsForReminder,
  isWhatsAppConfigured,
  sendFeeReminderWhatsApp,
} from "./whatsappservice.js";

export const runDailyFeeReminderJob = async () => {
  if (!isWhatsAppConfigured()) {
    console.log("WhatsApp reminder skipped: config missing.");
    return;
  }

  try {
    const academicYear = getAcademicYear();
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
    const monthlyFee = settings?.monthlyFee || 0;

    const students = await prisma.student.findMany({
      include: {
        payments: {
          where: {
            academicYear,
            status: "paid",
          },
          select: { month: true },
        },
      },
      orderBy: { id: "asc" },
    });

    for (const student of students) {
      const paidMonths = student.payments.map((p) => p.month);
      const dueMonths = getDueMonthsForReminder({ paidMonths });
      if (!dueMonths.length) continue;

      try {
        await sendFeeReminderWhatsApp({
          student,
          dueMonths,
          monthlyFee,
          academicYear,
        });
        console.log(`Reminder sent to ${student.name} (${student.phone})`);
      } catch (err) {
        console.error(`Reminder failed for student ${student.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Daily reminder job failed:", err.message);
  }
};
