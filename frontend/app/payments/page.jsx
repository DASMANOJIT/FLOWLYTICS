"use client";

import { useEffect, useState } from "react";
import "./page.css";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ;

export default function PaymentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  // Session months: March → next February
  const months = [
    "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December",
    "January", "February",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/api/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const handlePayment = async () => {
    if (!selectedStudent || !selectedMonth) {
      alert("Select student & month");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/payments/mark-paid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        studentId: selectedStudent.id,
        month: selectedMonth,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Payment marked successfully!");
    setSelectedStudent(null);
    setSelectedMonth("");
  };

  return (
    <div className="payment-container">

      {/* BACK BUTTON */}
      <Link href="/admin" className="back-btn">
        ← Back to Dashboard
      </Link>

      <h1 className="payment-title">Cash Payment Entry</h1>

      <div className="payment-box">
        <label>Search Student</label>
        <input
          type="text"
          className="student-search-input"
          placeholder="Search student by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <div className="student-search-results">
            {students
  .filter((s) => {
    const query = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.phone?.toLowerCase().includes(query)
    );
  })
  .slice(0, 7)
  .map((s) => (

                <div
                  key={s.id}
                  className="student-result-item"
                  onClick={() => {
                    setSelectedStudent(s);
                    setSearch("");
                  }}
                >
                  {s.name} — Class {s.class}
                </div>
              ))}
          </div>
        )}

        {selectedStudent && (
          <p className="selected-student-box">
            Selected: <strong>{selectedStudent.name}</strong> (Class{" "}
            {selectedStudent.class})
          </p>
        )}

        <label>Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <button
          className="pay-btn"
          disabled={!selectedStudent || !selectedMonth}
          onClick={handlePayment}
        >
          Mark as Paid
        </button>
      </div>
    </div>
  );
}
