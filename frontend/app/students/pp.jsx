"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import "./students.css";

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => setStudent(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!student) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">{student.name}</h1>

        <div className="profile-info">
          <p><strong>Class:</strong> {student.class}</p>
          <p><strong>Roll No:</strong> {student.rollno}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Email:</strong> {student.email}</p>

          <p><strong>Fees Paid Months:</strong> {student.paidMonths?.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}
