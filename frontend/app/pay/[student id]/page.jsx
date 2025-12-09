"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import "./pay.css";

export default function PayPage({ params }) {
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const amount = searchParams.get("amount");
  const studentId = params.id;

  const [method, setMethod] = useState("upi");

  return (
    <div className="pay-wrapper">
      <h1 className="pay-heading">Fee Payment</h1>

      <div className="pay-card">
        <h2 className="student-title">Student ID: {studentId}</h2>

        <p className="pay-row"><strong>Month:</strong> {month}</p>
        <p className="pay-row"><strong>Amount:</strong> ₹{amount}</p>

        <h3 className="pay-method-title">Choose Payment Method</h3>

        <div className="method-list">
          <button
            className={`method-btn ${method === "upi" ? "active" : ""}`}
            onClick={() => setMethod("upi")}
          >
            UPI
          </button>

          <button
            className={`method-btn ${method === "card" ? "active" : ""}`}
            onClick={() => setMethod("card")}
          >
            Card
          </button>

          <button
            className={`method-btn ${method === "netbank" ? "active" : ""}`}
            onClick={() => setMethod("netbank")}
          >
            Net Banking
          </button>
        </div>

        {/* ------------------- UPI SECTION ------------------- */}
        {method === "upi" && (
          <div className="method-box">
            <p className="method-label">Enter UPI ID</p>
            <input className="input-box" type="text" placeholder="example@upi" />
          </div>
        )}

        {/* ------------------- CARD SECTION ------------------- */}
        {method === "card" && (
          <div className="method-box">
            <p className="method-label">Card Number</p>
            <input className="input-box" type="text" />

            <div className="card-row">
              <input className="input-box" type="text" placeholder="MM/YY" />
              <input className="input-box" type="password" placeholder="CVV" />
            </div>
          </div>
        )}

        {/* ------------------- NET BANKING SECTION ------------------- */}
        {method === "netbank" && (
          <div className="method-box">
            <p className="method-label">Select Bank</p>
            <select className="input-box">
              <option>SBI</option>
              <option>HDFC</option>
              <option>ICICI</option>
              <option>Axis Bank</option>
              <option>Punjab National Bank</option>
            </select>
          </div>
        )}

        {/* PAYMENT BUTTON */}
        <button className="final-pay-btn">
          Confirm & Pay ₹{amount}
        </button>
      </div>
    </div>
  );
}
