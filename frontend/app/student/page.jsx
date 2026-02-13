"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./student.css";
import Nav from "../components/navbar/navbar.jsx";
import jsPDF from "jspdf";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalMonthlyFees, setTotalMonthlyFees] = useState(0); // <-- dynamic fee
  const handlePay = (month) => {
  if (!student) {
    console.error("Student not loaded yet", student);
    return;
  }

  router.push(
  `/pay/${student.id}?month=${month}&amount=${student.monthlyFee}`
);

};


  const months = [
    "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December",
    "January", "February",
  ];

  // ===============================
  // FETCH STUDENT + PAYMENTS
  // ===============================
  useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const [studentRes, paymentRes] = await Promise.all([
        fetch(`${API_BASE}/api/students/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/api/payments/my`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!studentRes.ok) throw new Error("Failed to fetch student");
      if (!paymentRes.ok) throw new Error("Failed to fetch payments");

      const studentData = await studentRes.json();
      setStudent(studentData);
      setTotalMonthlyFees(studentData.monthlyFee || 0);

      const paymentData = await paymentRes.json();
      setPayments(paymentData);
    } catch (err) {
      console.error("Fetch error:", err);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [router]);

  // ===============================
  // CALCULATIONS
  // ===============================
  const paidCount = payments.filter(
    (p) => p.status === "paid"
  ).length;

  const progressPercent = (paidCount / months.length) * 100;

  // ===============================
  // UPCOMING FEE LOGIC (NO UI CHANGE)
  // ===============================
  const paidMonthsSet = new Set(
    payments.filter(p => p.status === "paid").map(p => p.month)
  );

  // All unpaid months in academic order
  const unpaidMonths = months.filter(month => !paidMonthsSet.has(month));

  // Get current academic month (March → February)
  const now = new Date();
  const jsMonthIndex = now.getMonth(); // 0 = Jan
  const academicMonthIndex = jsMonthIndex >= 2 ? jsMonthIndex - 2 : jsMonthIndex + 10;
  const currentAcademicMonth = months[academicMonthIndex];

  // Priority logic
  let upcomingMonth = { month: "All Paid", amount: 0 };

  // 1️⃣ Backlog first
  if (unpaidMonths.length > 0) {
    upcomingMonth = {
      month: unpaidMonths[0],
      amount: totalMonthlyFees,
    };
  }
  // 2️⃣ Else current month if unpaid
  else if (!paidMonthsSet.has(currentAcademicMonth)) {
    upcomingMonth = {
      month: currentAcademicMonth,
      amount: totalMonthlyFees,
    };
  }




  // ===============================
  // MODERN PDF RECEIPT
  // ===============================
  // ===============================
  // MODERN & PROFESSIONAL PDF RECEIPT
  // ===============================
  const downloadReceiptPDF = (month) => {
    const doc = new jsPDF("p", "mm", "a4");

    // ---------- COLORS ----------
    const textDark = [40, 40, 40];
    const grayBg = [246, 247, 249];

    // ---------- PAGE SIZE ----------
    const pageWidth = 210;

    // ---------- HEADER (LINEAR GRADIENT SIMULATION) ----------
    const headerHeight = 45;
    const startColor = { r: 255, g: 49, b: 49 };   // #ff3131
    const endColor = { r: 255, g: 145, b: 77 };  // #ff914d

    for (let i = 0; i < headerHeight; i++) {
      const r = Math.round(startColor.r + ((endColor.r - startColor.r) * i) / headerHeight);
      const g = Math.round(startColor.g + ((endColor.g - startColor.g) * i) / headerHeight);
      const b = Math.round(startColor.b + ((endColor.b - startColor.b) * i) / headerHeight);

      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 1, "F");
    }


    // ---------- LOGO (CENTERED) ----------
    const img = new Image();
    img.src = "/logo.png";

    img.onload = () => {
      const logoSize = 28;
      const logoX = (pageWidth - logoSize) / 2;
      const logoY = 8;

      doc.addImage(img, "PNG", logoX, logoY, logoSize, logoSize);

      // ---------- TITLE ----------
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("Payment Receipt", pageWidth / 2, 42, { align: "center" });

      // ---------- RECEIPT CARD ----------
      doc.setFillColor(...grayBg);
      doc.roundedRect(15, 55, 180, 120, 6, 6, "F");

      // ---------- CARD TITLE ----------
      doc.setTextColor(...textDark);
      doc.setFontSize(15);
      doc.text("Receipt Details", pageWidth / 2, 72, { align: "center" });

      doc.setLineWidth(0.5);
      doc.line(60, 76, 150, 76);

      // ---------- DETAILS ----------
      doc.setFontSize(11);
      const leftX = 32;
      const rightX = 120;
      let y = 92;

      doc.text("Student Name", leftX, y);
      doc.text(student?.name || "-", rightX, y);

      y += 14;
      doc.text("Payment Month", leftX, y);
      doc.text(month, rightX, y);

      y += 14;
      doc.text("Amount Paid", leftX, y);
      doc.text(`₹ ${totalMonthlyFees}`, rightX, y);

      y += 14;
      doc.text("Payment Date", leftX, y);
      doc.text(new Date().toLocaleDateString(), rightX, y);

      y += 14;
      doc.text("Payment Status", leftX, y);
      doc.setTextColor(34, 197, 94); // modern green
      doc.text("PAID", rightX, y);

      // Reset text color
      doc.setTextColor(...textDark);

      // ---------- FOOTER ----------
      doc.setFontSize(9);
      doc.setTextColor(120);

      doc.text(
        "This is a system generated receipt and does not require a signature.",
        pageWidth / 2,
        190,
        { align: "center" }
      );

      doc.text(
        "Thank you for choosing Subho's Computer Institute",
        pageWidth / 2,
        198,
        { align: "center" }
      );

      // ---------- SAVE ----------
      doc.save(`${student?.name || "student"}_${month}_receipt.pdf`);
    };
  };




  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-wrapper">
      <Nav />

      <div className="student-header">
        <h1 className="student-name">____________</h1>
        <h1 className="student-name">____________</h1>
        <p className="student-subtitle">Student Dashboard</p>
      </div>
<div className="dashboard-top">
      <div className="total-fees-container">
        <h2 className="total-title">Total Monthly Fees</h2>
        <p className="total-amount">₹{totalMonthlyFees}</p>
       

      </div>
 
 

</div>

      <div className="progress-section">
        <p className="progress-label">
          Fees Paid: {paidCount}/{months.length}
        </p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <h3 className="section-heading">Monthly Fee Details</h3>

      <div className="month-list">
        {months.map((month) => {
          const isPaid = payments.some(
            (p) => p.month === month && p.status === "paid"
          );

          return (
            <div key={month} className="month-card">
              <div className="month-info">
                <p className="month-name">{month}</p>
                <p className="month-fee">₹{totalMonthlyFees}</p>
              </div>

              {isPaid ? (
                <button
                  className="receipt-button"
                  onClick={() => downloadReceiptPDF(month)}
                >
                  Download PDF Receipt
                </button>
              ) : (
                <button
                  className="pay-button"
                  onClick={() => handlePay(month)}
                >
                  Pay Now
                </button>


              )}
            </div>
          );
        })}
      </div>

      <div className="upcoming-container">
        <h3 className="upcoming-title">Upcoming Fee</h3>
        <div className="upcoming-content">
          <div>
            <p className="upcoming-month">{upcomingMonth.month}</p>
            <p className="upcoming-amount">₹{upcomingMonth.amount}</p>
          </div>
          <span className="due-label">
            {upcomingMonth.month === "All Paid" ? "✔ No Dues" : "Due Soon"}
          </span>
        </div>
      </div>
    </div>
  );
}
