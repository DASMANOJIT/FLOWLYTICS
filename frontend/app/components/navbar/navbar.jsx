"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import "./navbar.css";

export default function StudentNavbar() {
  const [studentName, setStudentName] = useState(""); // dynamic
  const [open, setOpen] = useState(false);

  // ========================
  // FETCH STUDENT NAME
  // ========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/students/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.name) setStudentName(data.name);
      })
      .catch(err => console.error("Failed to fetch student name:", err));
  }, []);

  // ========================
  // Logout function
  // ========================
  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token
    window.location.href = "/login";   // redirect
  };

  return (
    <nav className="student-navbar">
      <div className="nav-inner">

        {/* LEFT → Logo */}
        <div className="nav-left">
          <Image
            src="/logo.png"
            width={120}
            height={40}
            alt="Logo"
            className="nav-logo"
            loading="eager"
          />
        </div>

        {/* RIGHT → Desktop navigation */}
        <div className="nav-right desktop-only">
          <Link href="/profile" className="student-profile-link">
            <Image
              src="/user.png" // replace with your icon path
              width={40}
              height={35}
              alt="User Icon"
              className="user-icon"
            />
            <span className="student-name">HELLO {studentName.toUpperCase()}</span>
          </Link>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* RIGHT → Hamburger on mobile */}
        <div className="hamburger mobile-only" onClick={() => setOpen(!open)}>
          <div className={open ? "bar bar1 active" : "bar bar1"}></div>
          <div className={open ? "bar bar2 active" : "bar bar2"}></div>
          <div className={open ? "bar bar3 active" : "bar bar3"}></div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="mobile-menu">
          <Link href="/profile" className="student-profile-link">
            <Image
              src="/user.png" // replace with your icon path
              width={25}
              height={25}
              alt="User Icon"
              className="user-icon-mobile"
            />
            <span className="student-name-mobile">HELLO {studentName.toUpperCase()}</span>
          </Link>
          <button className="logout-btn-mobile" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
