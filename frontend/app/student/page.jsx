"use client";
import { useState } from "react";
import "./student.css";
import Nav from '../components/navbar/navbar.jsx';
import jsPDF from "jspdf";

export default function StudentDashboard() {
  const studentName = "Hello Student";

  const totalMonthlyFees = 600;

  const [months, setMonths] = useState([
    { month: "March", amount: 600, paid: false },
    { month: "April", amount: 600, paid: false },
    { month: "May", amount: 600, paid: false },
    { month: "June", amount: 600, paid: false },
    { month: "July", amount: 600, paid: false },
    { month: "August", amount: 600, paid: false },
    { month: "September", amount: 600, paid: false },
    { month: "October", amount: 600, paid: false },
    { month: "November", amount: 600, paid: false },
    { month: "December", amount: 600, paid: false },
    { month: "January", amount: 600, paid: false },
    { month: "February", amount: 600, paid: false },
  ]);

  // ---- Auto Detect Upcoming Unpaid Month (Session: March → February) ----
  const sessionOrder = [
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

  const upcomingMonth =
    months.find((m) => !m.paid) || { month: "All Paid", amount: 0 };

  // ---- Payment Handler ----
  const handlePayment = (index) => {
    const updated = [...months];
    updated[index].paid = true;
    setMonths(updated);
  };

  // ---- Calculate Paid Percentage ----
  const paidCount = months.filter((m) => m.paid).length;
  const progressPercent = (paidCount / months.length) * 100;

  const downloadReceiptPDF = (month) => {
    const doc = new jsPDF();

    // ----- Add Logo (must be in public/logo.png) -----
    const logo = "/logo.jpg"; // public folder path

    doc.addImage(logo, "PNG", 15, 10, 40, 20); // x, y, width, height

    // ----- Title -----
    doc.setFontSize(20);
    doc.text("PAYMENT RECEIPT", 105, 45, { align: "center" });

    doc.setFontSize(12);
    doc.text("SUBHO'S COMPUTER INSTITUTE", 105, 55, { align: "center" });
    doc.text("E.S.T.D : 2004", 105, 62, { align: "center" });

    // ----- Receipt Box -----
    doc.setFontSize(14);
    doc.text("Student Name: " + studentName, 20, 80);
    doc.text("Month: " + month.month, 20, 95);
    doc.text("Amount Paid: Rs." + month.amount, 20, 110);
    doc.text("Date: " + new Date().toLocaleDateString(), 20, 125);
    doc.text("Status: PAID", 20, 140);

    // ----- Footer -----
    doc.setFontSize(10);
    doc.text(
      "Thank you for your payment!",
      105,
      270,
      { align: "center" }
    );

    // Save file
    doc.save(`${month.month}_receipt.pdf`);
  };

  return (
    <div className="dashboard-wrapper">
      <Nav />

      {/* Student Heading */}
      <div className="student-header">

        <h1 className="student-name">________</h1>
        <h1 className="student-name">________</h1>
        <p className="student-subtitle">Student Dashboard</p>
      </div>

      {/* Total Fees */}
      <div className="total-fees-container">
        <h2 className="total-title">Total Monthly Fees</h2>
        <p className="total-amount">₹{totalMonthlyFees}</p>
      </div>

      {/* ---------------- Progress Bar ---------------- */}
      <div className="progress-section">
        <p className="progress-label">
          Fees Paid: {paidCount}/{months.length}
        </p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <h3 className="section-heading">Monthly Fee Details</h3>

      <div className="month-list">
        {months.map((m, index) => (
          <div key={index} className="month-card">
            <div className="month-info">
              <p className="month-name">{m.month}</p>
              <p className="month-fee">₹{m.amount}</p>
            </div>

            {m.paid ? (
              <div className="paid-actions">
                <span className="paid-label">Paid</span>
                <button
                  className="receipt-button"
                  onClick={() => downloadReceiptPDF(m)}
                >
                  Download PDF Receipt
                </button>

              </div>
            ) : (
              <button
                className="pay-button"
                onClick={() => window.location.href = `/pay/123?month=${m.month}&amount=${m.amount}`}
              >
                Pay Now
              </button>

            )}
          </div>
        ))}
      </div>

      {/* Upcoming */}
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
