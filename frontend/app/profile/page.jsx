"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ;

export default function StudentSelfProfile() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH PROFILE + PAYMENTS
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`${API_BASE}/api/students/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/api/payments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([studentRes, paymentRes]) => {
        if (!studentRes.ok || !paymentRes.ok) throw new Error();

        const studentData = await studentRes.json();
        const paymentData = await paymentRes.json();

        setStudent(studentData);
        setPayments(paymentData || []);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="self-profile-page">
      <div className="profile-card">

        {/* BACK BUTTON */}
        <button
          className="back-dashboard-btn"
          onClick={() => router.push("/student")}
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar">
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="profile-title">{student.name}</h1>
            <p className="profile-subtitle">Your Profile</p>
          </div>
        </div>

        {/* PROFILE INFO */}
        <div className="profile-grid">
          <div className="info-item">
            <span>Class</span>
            <p>{student.class || "-"}</p>
          </div>

          <div className="info-item">
            <span>School</span>
            <p>{student.school || "-"}</p>
          </div>

          <div className="info-item">
            <span>Phone</span>
            <p>{student.phone}</p>
          </div>

          <div className="info-item">
            <span>Email</span>
            <p>{student.email}</p>
          </div>
        </div>

        {/* =========================
            PAYMENT HISTORY
        ========================= */}
        <div className="payment-history">
          <h3>Payment History</h3>

          {payments.length ? (
            <div className="payment-list">
              {payments.map((p) => (
                <div key={p.id} className="payment-item">
                  <div>
                    <p className="payment-month">{p.month}</p>
                    <p className="payment-date">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="payment-right">
                    <p className="payment-amount">₹{p.amount}</p>
                    <span
                      className={
                        p.status === "paid"
                          ? "status-paid"
                          : "status-unpaid"
                      }
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No payment records found</p>
          )}
        </div>
      </div>
    </div>
  );
}
