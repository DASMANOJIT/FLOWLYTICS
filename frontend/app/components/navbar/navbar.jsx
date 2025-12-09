"use client";
import Image from "next/image";
import { useState } from "react";
import "./navbar.css";

export default function StudentNavbar() {

  // Temporary student data
  const [studentName] = useState("Hello Student");

  // Mobile menu toggle
  const [open, setOpen] = useState(false);

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
          <span className="student-name">{studentName}</span>
          <button className="logout-btn">Logout</button>
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
          <span className="student-name-mobile">{studentName}</span>
          <button className="logout-btn-mobile">Logout</button>
        </div>
      )}
    </nav>
  );
}
