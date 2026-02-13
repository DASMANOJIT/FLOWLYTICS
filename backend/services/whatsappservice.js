const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const WHATSAPP_GRAPH_URL = process.env.WHATSAPP_GRAPH_URL || "https://graph.facebook.com";

const MONTHS = [
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
];

export const isWhatsAppConfigured = () => {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  );
};

const normalizePhoneNumber = (rawPhone) => {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);

  const defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91";
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  return digits;
};

const whatsappEndpoint = (suffix) =>
  `${WHATSAPP_GRAPH_URL}/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}${suffix}`;

const whatsappHeaders = () => ({
  Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
});

export const sendWhatsAppTemplateMessage = async ({
  to,
  templateName,
  languageCode = "en",
  bodyParams = [],
}) => {
  const toPhone = normalizePhoneNumber(to);
  if (!toPhone) return;

  const body = {
    messaging_product: "whatsapp",
    to: toPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: bodyParams.length
        ? [
            {
              type: "body",
              parameters: bodyParams.map((param) => ({
                type: "text",
                text: String(param),
              })),
            },
          ]
        : [],
    },
  };

  const res = await fetch(whatsappEndpoint("/messages"), {
    method: "POST",
    headers: {
      ...whatsappHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "WhatsApp template send failed");
  }
};

export const sendWhatsAppTextMessage = async ({ to, message }) => {
  const toPhone = normalizePhoneNumber(to);
  if (!toPhone) return;

  const res = await fetch(whatsappEndpoint("/messages"), {
    method: "POST",
    headers: {
      ...whatsappHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "WhatsApp text send failed");
  }
};

export const createPaymentReceiptPdf = async ({ student, payment, mode }) => {
  let PDFDocument;
  try {
    const pdfkit = await import("pdfkit");
    PDFDocument = pdfkit.default;
  } catch (err) {
    throw new Error(
      "pdfkit is not installed. Run: cd backend && npm install pdfkit"
    );
  }

  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(22).text("Fee Payment Receipt", { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(12);
    doc.text(`Student Name: ${student?.name || "-"}`);
    doc.text(`Student ID: ${student?.id || "-"}`);
    doc.text(`Phone: ${student?.phone || "-"}`);
    doc.moveDown(0.8);
    doc.text(`Month: ${payment?.month || "-"}`);
    doc.text(`Academic Year: ${payment?.academicYear || "-"}`);
    doc.text(`Amount Paid: INR ${payment?.amount || 0}`);
    doc.text(`Status: ${payment?.status || "paid"}`);
    doc.text(`Payment Mode: ${mode || "online"}`);
    doc.text(`Receipt Date: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
    doc.moveDown(1.2);
    doc.text("This is a system generated receipt.", { align: "left" });

    doc.end();
  });
};

const uploadMediaToWhatsApp = async ({ fileBuffer, filename, mimeType }) => {
  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append(
    "file",
    new Blob([fileBuffer], { type: mimeType }),
    filename
  );

  const res = await fetch(whatsappEndpoint("/media"), {
    method: "POST",
    headers: whatsappHeaders(),
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.id) {
    throw new Error(data?.error?.message || "WhatsApp media upload failed");
  }

  return data.id;
};

export const sendWhatsAppDocumentByMediaId = async ({
  to,
  mediaId,
  filename,
  caption,
}) => {
  const toPhone = normalizePhoneNumber(to);
  if (!toPhone) return;

  const res = await fetch(whatsappEndpoint("/messages"), {
    method: "POST",
    headers: {
      ...whatsappHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toPhone,
      type: "document",
      document: {
        id: mediaId,
        filename,
        caption,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "WhatsApp document send failed");
  }
};

export const sendFeePaidWhatsAppNotification = async ({
  student,
  payment,
  mode,
}) => {
  if (!isWhatsAppConfigured() || !student?.phone) return;

  const templateName = process.env.WHATSAPP_FEE_PAID_TEMPLATE;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG || "en";

  if (templateName) {
    await sendWhatsAppTemplateMessage({
      to: student.phone,
      templateName,
      languageCode,
      bodyParams: [student.name, payment.month, payment.amount],
    });
  } else {
    await sendWhatsAppTextMessage({
      to: student.phone,
      message: `Hi ${student.name}, your fee for ${payment.month} is received. Amount: INR ${payment.amount}. Mode: ${mode}.`,
    });
  }

  try {
    const pdfBuffer = await createPaymentReceiptPdf({ student, payment, mode });
    const mediaId = await uploadMediaToWhatsApp({
      fileBuffer: pdfBuffer,
      filename: `fee-receipt-${student.id}-${payment.month}.pdf`,
      mimeType: "application/pdf",
    });

    await sendWhatsAppDocumentByMediaId({
      to: student.phone,
      mediaId,
      filename: `fee-receipt-${payment.month}.pdf`,
      caption: `Receipt for ${payment.month} (${payment.academicYear}-${payment.academicYear + 1})`,
    });
  } catch (err) {
    console.error("WhatsApp PDF send skipped:", err.message);
  }
};

const getCurrentAcademicMonthIndex = () => {
  const jsMonthIndex = new Date().getMonth();
  return jsMonthIndex >= 2 ? jsMonthIndex - 2 : jsMonthIndex + 10;
};

export const getDueMonthsForReminder = ({ paidMonths }) => {
  const paidSet = new Set((paidMonths || []).map((m) => String(m)));
  const currentIndex = getCurrentAcademicMonthIndex();
  const dueMonths = [];

  for (let i = 0; i <= currentIndex; i += 1) {
    const month = MONTHS[i];
    if (!paidSet.has(month)) dueMonths.push(month);
  }

  return dueMonths;
};

export const sendFeeReminderWhatsApp = async ({
  student,
  dueMonths,
  monthlyFee,
  academicYear,
}) => {
  if (!isWhatsAppConfigured() || !student?.phone || !dueMonths.length) return;

  const templateName = process.env.WHATSAPP_FEE_REMINDER_TEMPLATE;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG || "en";
  const totalDue = dueMonths.length * Number(monthlyFee || 0);

  if (templateName) {
    await sendWhatsAppTemplateMessage({
      to: student.phone,
      templateName,
      languageCode,
      bodyParams: [
        student.name,
        dueMonths.join(", "),
        totalDue,
        `${academicYear}-${academicYear + 1}`,
      ],
    });
    return;
  }

  await sendWhatsAppTextMessage({
    to: student.phone,
    message: `Hi ${student.name}, fee reminder for ${academicYear}-${academicYear + 1}. Pending months: ${dueMonths.join(", ")}. Total due: INR ${totalDue}.`,
  });
};
