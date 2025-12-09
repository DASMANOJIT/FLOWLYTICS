"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./admin.css";
import Cal from '../components/calender/calender.jsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);


  

  // NEW: search
  const [search, setSearch] = useState("");

  // mobile search visibility
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Temporary student data
  const [students] = useState([
    { id: 1, name: "Rahul Sharma", roll: "101", status: "Paid" },
    { id: 2, name: "Priya Das", roll: "102", status: "Unpaid" },
    { id: 3, name: "Amit Kumar", roll: "103", status: "Paid" },
  ]);

  // Filtered student list
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Stats (temporary)
  const stats = {
    totalStudents: students.length,
    paid: students.filter(s => s.status === "Paid").length,
    unpaid: students.filter(s => s.status === "Unpaid").length,
    revenue: 5000,
  };

  const pieData = {
    labels: ["Paid", "Unpaid"],
    datasets: [
      {
        data: [stats.paid, stats.unpaid],
        backgroundColor: ["#16a34a", "#dc2626"],
        borderWidth: 0
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } }
  };

  // close mobile search when resizing to desktop (optional small UX nicety)
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 820 && mobileSearchOpen) setMobileSearchOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileSearchOpen]);

  // NEW: Monthly fee state
const [monthlyFee, setMonthlyFee] = useState(0);

 // await fetch("/api/set-monthly-fee", {
 // method: "POST",
  //body: JSON.stringify({ fee: monthlyFee })
//});


  return (
    <div className={`admin-dashboard `} id="dashboard-root">

      {/* ======= NAVBAR ======= */}
      <nav className="admin-nav">
        <div className="nav-left">
          <h2 className="nav-title">Admin Dashboard</h2>
        </div>

        <div className="nav-actions">
          {/* On desktop this area will remain unused for the input; mobile shows the search button */}
          <button
            className="search-toggle-btn"
            onClick={() => setMobileSearchOpen((s) => !s)}
            aria-expanded={mobileSearchOpen}
            aria-label="Toggle search"
          >
            🔍
          </button>

         
          {/* ☰ Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link href="/">Home</Link>
          <Link href="/students">Students</Link>
          <Link href="/">Payments</Link>
          <button className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* ======= SLIDING SEARCH BAR (appears UNDER navbar) ======= */}
      {/* Desktop: visible and functional; Mobile: hidden until search button clicked */}
      <div className={`sliding-search-wrapper ${mobileSearchOpen ? "open" : ""}`}>
        <div className="modern-search-wrapper">
          <input
            type="text"
            className="modern-search-bar"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="modern-search-btn"
            onClick={() => {
              /* keep button for accessibility; input already filters live */
              document.querySelector(".modern-search-bar")?.focus();
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* ======= SUMMARY BOXES ======= */}
      <div className="monthly-summary">
        <div className="summary-box">
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>

        <div className="summary-box">
          <h3>Paid</h3>
          <p>{stats.paid}</p>
        </div>

        <div className="summary-box">
          <h3>Unpaid</h3>
          <p>{stats.unpaid}</p>
        </div>

        <div className="summary-box">
          <h3>Total Revenue</h3>
          <p>₹{stats.revenue}</p>
        </div>
      </div>

      {/* ======= MAIN ROW (Chart + Calendar) ======= */}
      <div className="chart-calendar-row">
        <div className="chart-container">
          <h2 className="chart-title">Monthly Fee Status</h2>
          <Pie data={pieData} options={pieOptions} />
        </div>

        <Cal />
      </div>
      {/* ======= SET MONTHLY FEES ======= */}
<h2>Set Monthly Fees</h2>
<div className="set-fee-box">
  <input
    type="number"
    className="fee-input"
    placeholder="Enter monthly fee (₹)"
    value={monthlyFee}
    onChange={(e) => setMonthlyFee(e.target.value)}
  />

  <button
    className="fee-save-btn"
    onClick={() => alert(`Monthly Fee Updated: ₹${monthlyFee}`)}
  >
    Save Fee
  </button>
</div>


      {/* ======= STUDENT LIST ======= */}
      <h2>Students List</h2>
      <div className="student-list">
        {filteredStudents.map((s, i) => (
          <div className="student-item" key={s.id} style={{ animationDelay: `${i * 0.1}s` }}>
            <div>
              <h3>{s.name}</h3>
              <p>Roll: {s.roll}</p>
            </div>

            <span className={s.status === "Paid" ? "status-paid" : "status-unpaid"}>
              {s.status}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
