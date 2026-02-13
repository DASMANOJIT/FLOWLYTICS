import prisma from "../prisma/client.js";
import { phonepeConfig, generateChecksum } from "../config/phonepe.config.js";
import { getAcademicYear } from "../utils/academicYear.js";
import { sendFeePaidWhatsAppNotification } from "../services/whatsappservice.js";

export const initiatePhonePePayment = async (req, res) => {
  try {
    const { studentId, amount, month } = req.body;
    const tokenStudentId = Number(req.user?.id);
    const requestedStudentId = Number(studentId);
    const numericAmount = Number(amount);
    const academicYear = getAcademicYear();
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const backendBaseUrl = process.env.BACKEND_URL || "http://localhost:5000";

    if (req.userRole !== "student") {
      return res.status(403).json({ message: "Only students can initiate payment" });
    }

    if (!requestedStudentId || tokenStudentId !== requestedStudentId) {
      return res.status(403).json({ message: "You can only pay your own fees" });
    }

    if (!month || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment payload" });
    }

    if (
      !phonepeConfig.merchantId ||
      !phonepeConfig.saltKey ||
      !phonepeConfig.saltIndex ||
      !phonepeConfig.baseUrl
    ) {
      return res.status(500).json({ message: "PhonePe is not configured on server" });
    }

    const existing = await prisma.payment.findFirst({
      where: {
        studentId: requestedStudentId,
        month,
        academicYear,
      },
    });

    if (existing?.status === "paid") {
      return res.status(400).json({ message: "This month is already paid" });
    }

    const transactionId = `TXN_${requestedStudentId}_${Date.now()}`;

    const payload = {
      merchantId: phonepeConfig.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: `STU_${requestedStudentId}`,
      amount: numericAmount * 100,
      redirectUrl: `${frontendBaseUrl}/payment-success?txnid=${transactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${backendBaseUrl}/api/payments/phonepe/callback`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const { base64Payload, checksum } = generateChecksum(payload);
    const phonePeResponse = await fetch(`${phonepeConfig.baseUrl}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        accept: "application/json",
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const phonePeData = await phonePeResponse.json();
    const redirectUrl =
      phonePeData?.data?.instrumentResponse?.redirectInfo?.url || null;

    if (!phonePeResponse.ok || !phonePeData?.success || !redirectUrl) {
      console.error("PhonePe initiation failed:", phonePeData);
      return res.status(502).json({ message: "PhonePe initiation failed" });
    }

    if (existing) {
      await prisma.payment.update({
        where: { id: existing.id },
        data: {
          amount: numericAmount,
          status: "created",
          phonepeTransactionId: transactionId,
          phonepePaymentId: null,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          studentId: requestedStudentId,
          month,
          amount: numericAmount,
          academicYear,
          status: "created",
          phonepeTransactionId: transactionId,
        },
      });
    }

    res.json({
      redirectUrl,
      merchantTransactionId: transactionId,
    });
  } catch (err) {
    console.error("PhonePe error:", err);
    res.status(500).json({ message: "PhonePe initiation failed" });
  }
};

export const phonePeCallback = async (req, res) => {
  try {
    let merchantTransactionId;
    let transactionId;
    let code;

    if (req.body?.response) {
      const decoded = JSON.parse(
        Buffer.from(req.body.response, "base64").toString("utf-8")
      );
      merchantTransactionId = decoded?.data?.merchantTransactionId;
      transactionId = decoded?.data?.transactionId;
      code = decoded?.code;
    } else {
      merchantTransactionId = req.body?.merchantTransactionId;
      transactionId = req.body?.transactionId;
      code = req.body?.code;
    }

    if (!merchantTransactionId) {
      return res.status(400).json({ message: "Invalid callback payload" });
    }

    const payment = await prisma.payment.findFirst({
      where: { phonepeTransactionId: merchantTransactionId },
    });

    if (!payment) return res.status(400).send("Payment not found");

    if (code === "PAYMENT_SUCCESS" || code === "SUCCESS") {
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          phonepePaymentId: transactionId,
        }
      });

      if (payment.status !== "paid") {
        const student = await prisma.student.findUnique({
          where: { id: Number(payment.studentId) },
          select: { id: true, name: true, phone: true },
        });

        if (student) {
          sendFeePaidWhatsAppNotification({
            student,
            payment: updatedPayment,
            mode: "phonepe",
          }).catch((err) => {
            console.error("WhatsApp fee-paid send failed (phonepe):", err.message);
          });
        }
      }
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed", phonepePaymentId: transactionId || null },
      });
    }

    return res.json({ message: "Callback processed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Callback error" });
  }
};

export const getPhonePePaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    if (!transactionId) {
      return res.status(400).json({ message: "transactionId required" });
    }

    const payment = await prisma.payment.findFirst({
      where: { phonepeTransactionId: transactionId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (
      req.userRole === "student" &&
      Number(req.user?.id) !== Number(payment.studentId)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.userRole !== "student" && req.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({
      status: payment.status,
      month: payment.month,
      amount: payment.amount,
      academicYear: payment.academicYear,
    });
  } catch (err) {
    console.error("PhonePe status error:", err);
    res.status(500).json({ message: "Failed to fetch payment status" });
  }
};
