"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./students.css";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function StudentsPage() {
  const router = useRouter();
  const initialParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState(initialParams?.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    initialParams?.get("status") || "all"
  );
  const [classFilter, setClassFilter] = useState(
    initialParams?.get("class") || "all"
  );
  const [schoolFilter, setSchoolFilter] = useState(
    initialParams?.get("school") || "all"
  );
  const [sortOrder, setSortOrder] = useState(initialParams?.get("sort") || "none");
  const [fromDate, setFromDate] = useState(initialParams?.get("from") || "");
  const [toDate, setToDate] = useState(initialParams?.get("to") || "");

  // 🔹 Fetch students
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_BASE}/api/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudents(data);
        else if (Array.isArray(data.students)) setStudents(data.students);
        else setStudents([]);
      })
      .catch((err) => console.error(err));
  }, [router]);

  // 🔹 Sync filters TO URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (classFilter !== "all") params.set("class", classFilter);
    if (schoolFilter !== "all") params.set("school", schoolFilter);
    if (sortOrder !== "none") params.set("sort", sortOrder);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    router.replace(`/students?${params.toString()}`, { scroll: false });
  }, [search, statusFilter, classFilter, schoolFilter, sortOrder, fromDate, toDate]);

  // 🔹 CLEAR ALL FILTERS
  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setClassFilter("all");
    setSchoolFilter("all");
    setSortOrder("none");
    setFromDate("");
    setToDate("");

    router.replace("/students", { scroll: false });
  };

  // 🔹 FILTER + SORT PIPELINE
  const filtered = students
  .filter((s) => {
    const query = search.toLowerCase();
    return (
      s?.name?.toLowerCase().includes(query) ||
      s?.phone?.toLowerCase().includes(query)
    );
  })
  .filter((s) => (statusFilter === "all" ? true : s.feesStatus === statusFilter))
  .filter((s) => (classFilter === "all" ? true : s.class === classFilter))
  .filter((s) => (schoolFilter === "all" ? true : s.school === schoolFilter))
  .filter((s) => {
    if (!fromDate && !toDate) return true;
    const joinDate = new Date(s.joinDate);
    if (fromDate && joinDate < new Date(fromDate)) return false;
    if (toDate && joinDate > new Date(toDate)) return false;
    return true;
  })
  .sort((a, b) => {
    if (sortOrder === "az") return a.name.localeCompare(b.name);
    return 0;
  });


  const classes = [...new Set(students.map((s) => s.class).filter(Boolean))];
  const schools = [...new Set(students.map((s) => s.school).filter(Boolean))];

  return (
    <div className="students-container">
      <h1 className="students-title">Students</h1>

      <Link href="/admin" className="back-btn">
        ← Back to Dashboard
      </Link>

      {/* SEARCH */}
      <div className="students-search-box">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <div className="students-filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Fees</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="none">Sort</option>
          <option value="az">Name A–Z</option>
        </select>

        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="all">All Classes</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
          <option value="all">All Schools</option>
          {schools.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

        {/* ✅ CLEAR ALL BUTTON */}
        <button
          type="button"
          className="clear-filters-btn"
          onClick={clearAllFilters}
        >
          Clear All
        </button>
      </div>

      {/* STUDENT LIST */}
      <div className="students-list">
        {filtered.map((student) => (
          <Link
            key={student.id}
            href={`/students/${student.id}`}
            className="student-card"
          >
            <h3>{student.name}</h3>
            <p>Class: {student.class}</p>
            <p>School: {student.school}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
