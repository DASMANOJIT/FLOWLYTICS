"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./students.css";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="students-container">
      <h1 className="students-title">Students</h1>

      <div className="students-search-box">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="students-list">
        {filtered.map((student) => (
          <Link
            href={`/students/${student.id}`}
            key={student.id}
            className="student-card"
          >
            <div>
              <h2>{student.name}</h2>
              <p>Class: {student.class}</p>
              <p>Roll No: {student.rollno}</p>
            </div>

            <div
              className={`fee-status ${
                student.feesStatus === "paid" ? "paid" : "unpaid"
              }`}
            >
              {student.feesStatus === "paid" ? "Paid" : "Unpaid"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
