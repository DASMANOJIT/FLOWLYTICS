import prisma from "../prisma/client.js";

// ADMIN: Set Monthly Fee (GLOBAL)
export const setMonthlyFee = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { fee } = req.body;
    const numericFee = Number(fee);

    if (!fee || isNaN(numericFee) || numericFee <= 0) {
      return res.status(400).json({ message: "Valid fee is required" });
    }

    // 🔥 Update AppSettings
    await prisma.appSettings.upsert({
      where: { id: 1 },
      update: { monthlyFee: numericFee },
      create: { id: 1, monthlyFee: numericFee },
    });

    // 🔁 Optional: update existing students
    await prisma.student.updateMany({
      data: { monthlyFee: numericFee },
    });

    res.json({
      message: `Monthly fee successfully updated to ₹${numericFee}`,
    });

  } catch (err) {
    console.error("Error updating monthly fee:", err);
    res.status(500).json({ message: "Failed to update monthly fee" });
  }
};
