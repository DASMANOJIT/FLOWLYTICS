"use client";
import { useState } from "react";
import "./login.css";
import Fall from "../animation/fallingword.jsx";

export default function Login() {
  const [activeForm, setActiveForm] = useState("login");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState("");
  const [forgotOtpInput, setForgotOtpInput] = useState("");

  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupGeneratedOtp, setSignupGeneratedOtp] = useState("");
  const [signupOtpInput, setSignupOtpInput] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPhoneVerified, setSignupPhoneVerified] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
      String(password || "")
    );

  const isValidPhone = (phone) => /^\+?\d{10,15}$/.test(String(phone || "").trim());
  const passwordChecks = {
    minLen: signupPassword.length >= 8,
    upper: /[A-Z]/.test(signupPassword),
    lower: /[a-z]/.test(signupPassword),
    number: /\d/.test(signupPassword),
    special: /[^A-Za-z0-9]/.test(signupPassword),
  };

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
  // SIGNUP OTP (LOCAL NOW)
  // =====================
  const sendSignupOtp = () => {
    if (!isValidPhone(signupPhone)) {
      alert("Please enter a valid phone number before OTP.");
      return;
    }

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSignupGeneratedOtp(generated);
    setSignupOtpSent(true);
    setSignupPhoneVerified(false);
    alert(`Signup OTP (local test): ${generated}`);
  };

  const verifySignupOtp = () => {
    if (!signupOtpSent) return alert("Send OTP first.");
    if (signupOtpInput.trim() !== signupGeneratedOtp) {
      setSignupPhoneVerified(false);
      return alert("Invalid OTP.");
    }
    setSignupPhoneVerified(true);
    alert("Phone number verified.");
  };

  // =====================
  // REGISTER (STUDENT ONLY)
  // =====================
  const handleRegister = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    const school = e.target.school.value;
    const studentClass = e.target.class.value;

    if (!isStrongPassword(password)) {
      return alert(
        "Password must be 8+ chars with uppercase, lowercase, number, and special character."
      );
    }

    if (!signupPhoneVerified) {
      return alert("Please verify phone number with OTP before signing up.");
    }

    try {
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
          role: "student",
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Registered successfully!");
      setSignupOtpSent(false);
      setSignupGeneratedOtp("");
      setSignupOtpInput("");
      setSignupPhoneVerified(false);
      setActiveForm("login");
    } catch (err) {
      alert("Cannot connect to backend!");
      console.error(err);
    }
  };

  // =====================
  // FORGOT OTP (LOCAL ONLY)
  // =====================
  const sendForgotOtp = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotGeneratedOtp(generated);
    setForgotOtpSent(true);
    alert(`Reset OTP (local test): ${generated}`);
  };

  // =====================
  // RESET PASSWORD
  // =====================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const newPassword = e.target.newPassword.value;

    if (!forgotOtpSent) {
      return alert("Please send OTP first.");
    }
    if (forgotOtpInput.trim() !== forgotGeneratedOtp) {
      return alert("Invalid OTP.");
    }
    if (!isStrongPassword(newPassword)) {
      return alert(
        "Password must be 8+ chars with uppercase, lowercase, number, and special character."
      );
    }

    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Password reset successfully!");
      setForgotOtpSent(false);
      setForgotGeneratedOtp("");
      setForgotOtpInput("");
      setActiveForm("login");
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
          WELCOME TO THE <br /> SUBHO&apos;S COMPUTER INSTITUTE
        </h1>
        <p className="login-subtitle">
          Secure student access with a modern experience.
        </p>
      </header>

      <div className="auth-shell">
      <div className={`card-wrapper ${activeForm}`}>
        <div className="auth-switch">
          <button
            type="button"
            className={`switch-btn ${activeForm === "login" ? "active" : ""}`}
            onClick={() => setActiveForm("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`switch-btn ${activeForm === "signup" ? "active" : ""}`}
            onClick={() => setActiveForm("signup")}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`switch-btn ${activeForm === "forgot" ? "active" : ""}`}
            onClick={() => setActiveForm("forgot")}
          >
            Reset
          </button>
        </div>

        {/* LOGIN */}
        <form className="card-form login-side" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input name="email" placeholder="Email" className="form-input" />
          <input
            name="password"
            type={showLoginPassword ? "text" : "password"}
            placeholder="Password"
            className="form-input"
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowLoginPassword((v) => !v)}
          >
            {showLoginPassword ? "🙈" : "👁"}
          </button>
          <button className="form-btn">Login</button>
          <p className="switch-link soft" onClick={() => setActiveForm("forgot")}>
            Forgot Password?
          </p>
          <p className="switch-link soft" onClick={() => setActiveForm("signup")}>
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
          <input
            name="phone"
            placeholder="Phone Number"
            className="form-input"
            value={signupPhone}
            onChange={(e) => {
              setSignupPhone(e.target.value);
              setSignupPhoneVerified(false);
            }}
          />
          <button type="button" className="form-btn" onClick={sendSignupOtp}>
            Send OTP (Local)
          </button>
          {signupOtpSent && (
            <>
              <input
                placeholder="Enter OTP"
                className="form-input"
                value={signupOtpInput}
                onChange={(e) => setSignupOtpInput(e.target.value)}
              />
              <button type="button" className="form-btn" onClick={verifySignupOtp}>
                Verify OTP
              </button>
            </>
          )}
          <p className="switch-link">
            {signupPhoneVerified ? "Phone verified" : "Phone not verified"}
          </p>

          <input
            name="password"
            type={showSignupPassword ? "text" : "password"}
            placeholder="Password"
            className="form-input"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowSignupPassword((v) => !v)}
          >
            {showSignupPassword ? "🙈" : "👁"}
          </button>
          <p className="password-rules">
            {passwordChecks.minLen ? "✓" : "•"} 8+ chars |{" "}
            {passwordChecks.upper ? "✓" : "•"} uppercase |{" "}
            {passwordChecks.lower ? "✓" : "•"} lowercase |{" "}
            {passwordChecks.number ? "✓" : "•"} number |{" "}
            {passwordChecks.special ? "✓" : "•"} special
          </p>

          <button className="form-btn" disabled={!signupPhoneVerified || !isStrongPassword(signupPassword)}>
            Sign Up
          </button>
          <p className="switch-link soft" onClick={() => setActiveForm("login")}>
            Already have an account?
          </p>
        </form>

        {/* FORGOT */}
        <form className="card-form forgot-side" onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <input name="email" placeholder="Email" className="form-input" />

          {!forgotOtpSent && (
            <button type="button" className="form-btn" onClick={sendForgotOtp}>
              Send OTP
            </button>
          )}

          {forgotOtpSent && (
            <>
              <input
                placeholder="Enter OTP"
                className="form-input"
                value={forgotOtpInput}
                onChange={(e) => setForgotOtpInput(e.target.value)}
              />
              <input
                name="newPassword"
                type="password"
                placeholder="New Password"
                className="form-input"
              />
              <button className="form-btn">Reset Password</button>
            </>
          )}

          <p className="switch-link soft" onClick={() => setActiveForm("login")}>
            Back to Login
          </p>
        </form>
      </div>
      </div>
    </div>
  );
}
