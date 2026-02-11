"use client";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import "./pay.css";

export default function PayPage() {
  const { id: studentId } = useParams();

  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const amount = searchParams.get("amount");
  const router = useRouter();


  const [method, setMethod] = useState("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [customUpiId, setCustomUpiId] = useState("");
  const [student, setStudent] = useState(null);
  const [isPaying, setIsPaying] = useState(false);


  useEffect(() => {
    if (!studentId) return;

    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/students/me`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Fetch failed:", res.status, errorText);
          throw new Error("Student fetch failed");
        }


        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Failed to fetch student details", err);
      }
    };

    fetchStudent();
  }, [studentId, router]);




  const handlePhonePePay = async () => {
    try {
      if (!month || !amount) {
        alert("Invalid payment details.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setIsPaying(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/payments/phonepe/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: student?.id || studentId,
            amount,
            month,
            preferredMethod: method,
            upiApp: selectedUpiApp,
            upiId: customUpiId.trim() || null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        alert(data.message || "Payment initiation failed");
        return;
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsPaying(false);
    }
  };



  return (
    <div className="pay-wrapper">
     
  <button
  className="back-btn"
  onClick={() => router.back()}
>
  ← Back
</button>


 




      <h1 className="pay-heading">Fee Payment</h1>

      <div className="pay-card">
        <h2 className="student-title">Student ID: {studentId}</h2>
        {student ? (
          <div className="student-info">
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Class:</strong> {student.class}</p>
            <p><strong>School:</strong> {student.school}</p>
          </div>
        ) : (
          <p>Loading student details...</p>
        )}



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
        {/* ------------------- UPI SECTION ------------------- */}
        {method === "upi" && (
          <div className="method-box">
            <p className="method-label">Pay using UPI Apps</p>

            <div className="upi-app-buttons">
              <button
                type="button"
                className={`upi-icon-btn ${selectedUpiApp === "gpay" ? "active" : ""}`}
                onClick={() => setSelectedUpiApp("gpay")}
              >
                <img src="/gpay.png" alt="Google Pay" />
              </button>

              <button
                type="button"
                className={`upi-icon-btn ${selectedUpiApp === "phonepe" ? "active" : ""}`}
                onClick={() => setSelectedUpiApp("phonepe")}
              >
                <img src="/phonpe.png" alt="PhonePe" />
              </button>
            </div>

            <p className="method-note">OR</p>

            <input
              className="input-box"
              type="text"
              placeholder="Enter any UPI ID (e.g. name@upi)"
              value={customUpiId}
              onChange={(e) => setCustomUpiId(e.target.value)}
            />

            <p className="method-note">
              You will be redirected to complete payment securely.
            </p>
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
        <button className="final-pay-btn" onClick={handlePhonePePay} disabled={isPaying}>
          {isPaying ? "Redirecting..." : `Pay ₹${amount}`}
        </button>

      </div>
    </div>
  );
}
