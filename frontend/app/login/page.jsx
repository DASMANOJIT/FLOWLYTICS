"use client";
import { useState } from "react";
import "./login.css";
import Fall from "../animation/fallingword.jsx";

export default function Login() {
  const [activeForm, setActiveForm] = useState("login");  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const sendOTP = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generated);
    setOtpSent(true);
    alert("Your OTP is: " + generated);
  };

  return (
    <div className="login-container">
      <Fall />

      <header className="login-header">
        <h1>
          WELCOME TO THE <br /> SUBHO'S COMPUTER INSTITUTE
        </h1>
      </header>

      {/* CARD */}
      <div className={`card-wrapper ${activeForm}`}>
        {/* LOGIN FORM */}
        <form className="card-form login-side">
          <h2>Login</h2>

          <input placeholder="Email" className="form-input" />
          <input type="password" placeholder="Password" className="form-input" />

          <button className="form-btn">Login</button>

          <p
            className="switch-link"
            onClick={() => setActiveForm("forgot")}
          >
            Forgot Password?
          </p>
          <p className="switch-link" onClick={() => setActiveForm("signup")}>
            Create an Account
          </p>
        </form>

        {/* SIGNUP FORM */}
        <form className="card-form signup-side">
          <h2>Sign Up</h2>

          <input placeholder="Full Name" className="form-input" />
          <input placeholder="Email" className="form-input" />
          <input placeholder="Phone Number" className="form-input" />
          <input type="password" placeholder="Password" className="form-input" />

          <button className="form-btn">Sign Up</button>

          <p className="switch-link" onClick={() => setActiveForm("login")}>
            Already have an account?
          </p>
        </form>

        {/* FORGOT PASSWORD FORM */}
        <form className="card-form forgot-side">
          <h2>Reset Password</h2>

          <input placeholder="Full Name" className="form-input" />
          <input placeholder="Email" className="form-input" />
          <input placeholder="Phone Number" className="form-input" />

          {!otpSent && (
            <button className="form-btn" type="button" onClick={sendOTP}>
              Send OTP
            </button>
          )}

          {otpSent && (
            <>
              <input placeholder="Enter OTP" className="form-input" />
              <input
                type="password"
                placeholder="New Password"
                className="form-input"
              />
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
