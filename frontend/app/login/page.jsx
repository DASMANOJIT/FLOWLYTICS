"use client";
import { useState } from "react";
import "./login.css";
import Fall from "../animation/fallingword.jsx";
import bcrypt from "bcryptjs";

export default function Login() {
  const [activeForm, setActiveForm] = useState("login");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const API = "http://localhost:5000";

  // =====================
  // LOGIN
  // =====================
  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("studentName", data.name);

      if (data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/student";
      }
    } catch (err) {
      alert("Cannot connect to backend!");
      console.error(err);
    }
  };

  // =====================
  // REGISTER  ✅ FIXED
  // =====================
  const handleRegister = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    const school = e.target.school.value;
    const studentClass = e.target.class.value;
    const role = e.target.role.value;

    try {
      // ✅ MISSING LINE (ROOT FIX)
      

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          school,
          class: studentClass,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Registered successfully!");
    } catch (err) {
      alert("Cannot connect to backend!");
      console.error(err);
    }
  };

  // =====================
  // SEND OTP (LOCAL ONLY)
  // =====================
  const sendOTP = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generated);
    setOtpSent(true);
    alert("Your OTP is: " + generated);
  };

  // =====================
  // RESET PASSWORD
  // =====================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const newPassword = e.target.newPassword.value;

    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Password reset successfully!");
    } catch (err) {
      alert("Cannot connect to backend!");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <Fall />

      <header className="login-header">
        <h1>
          WELCOME TO THE <br /> SUBHO'S COMPUTER INSTITUTE
        </h1>
      </header>

      <div className={`card-wrapper ${activeForm}`}>
        {/* LOGIN */}
        <form className="card-form login-side" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input name="email" placeholder="Email" className="form-input" />
          <input name="password" type="password" placeholder="Password" className="form-input" />
          <button className="form-btn">Login</button>
          <p className="switch-link" onClick={() => setActiveForm("forgot")}>
            Forgot Password?
          </p>
          <p className="switch-link" onClick={() => setActiveForm("signup")}>
            Create an Account
          </p>
        </form>

        {/* SIGNUP */}
        <form className="card-form signup-side" onSubmit={handleRegister}>
          <h2>Sign Up</h2>



          <input name="name" placeholder="Full Name" className="form-input" />
          <input name="school" placeholder="School Name" className="form-input" />
          <input name="class" placeholder="Class" className="form-input" />
          <input name="email" placeholder="Email" className="form-input" />
          <input name="phone" placeholder="Phone Number" className="form-input" />
          <input name="password" type="password" placeholder="Password" className="form-input" />

          <select name="role" className="form-input">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button className="form-btn">Sign Up</button>
          <p className="switch-link" onClick={() => setActiveForm("login")}>
            Already have an account?
          </p>
        </form>

        {/* FORGOT */}
        <form className="card-form forgot-side" onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <input name="name" placeholder="Full Name" className="form-input" />
          <input name="email" placeholder="Email" className="form-input" />
          <input name="phone" placeholder="Phone Number" className="form-input" />

          {!otpSent && (
            <button type="button" className="form-btn" onClick={sendOTP}>
              Send OTP
            </button>
          )}

          {otpSent && (
            <>
              <input placeholder="Enter OTP" className="form-input" />
              <input name="newPassword" type="password" placeholder="New Password" className="form-input" />
              <button className="form-btn">Reset Password</button>
            </>
          )}

          <p className="switch-link" onClick={() => setActiveForm("login")}>
            Back to Login
          </p>
        </form>
      </div>
    </div>
  );
}
