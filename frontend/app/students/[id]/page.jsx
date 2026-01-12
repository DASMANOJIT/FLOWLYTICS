"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./stu.css";

export default function StudentProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStudent(data));
  }, [id]);

  // 🔥 DELETE STUDENT
  const deleteStudent = async () => {
    const confirmDelete = confirm(
      "Are you sure?\nThis will permanently delete the student and all payment records."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/students/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      alert("Student deleted successfully");
      router.push("/students");

    } catch (err) {
      alert("Error deleting student");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return <p className="loading-text">Loading student profile...</p>;

  return (
    <div className="profile-page">

     
      

      <div className="profile-card">
         <button className="back-btn" onClick={() => router.back()}>
        ← Back to Students
      </button>

        <div className="profile-header">
          <div className="avatar">
            {student.name?.charAt(0).toUpperCase()}
          </div>
          {/* 🔴 DELETE BUTTON */}
      <button
        className="delete-student-btn"
        onClick={deleteStudent}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete Student"}
      </button>
      
          <div>
            <h1 className="profile-title">{student.name}</h1>
            <p className="profile-subtitle">Student Profile</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="info-item"><span>Class</span><p>{student.class || "—"}</p></div>
          <div className="info-item"><span>School</span><p>{student.school || "—"}</p></div>
          <div className="info-item"><span>Phone</span><p>{student.phone}</p></div>
          <div className="info-item"><span>Email</span><p>{student.email}</p></div>
        </div>





        <div className="fees-section" style={{ marginTop: "25px" }}>
          <h3>Payment Records</h3>

          {student.payments?.length ? (
            <div className="payment-record-list">
              {student.payments.map((p) => (
                <div key={p.id} className="payment-record-item">
                  <p><strong>Month:</strong> {p.month}</p>
                  <p><strong>Amount:</strong> ₹{p.amount}</p>
                  <p><strong>Status:</strong> {p.status}</p>
                  <p className="payment-date">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No payment history found</p>
          )}
        </div>
      </div>
    </div>
  );
}
