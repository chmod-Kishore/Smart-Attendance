import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { SHA256 } from "crypto-js";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [SaveOTP, setOtp] = useState(
    Math.floor(100000 + Math.random() * 900000) || 0
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setInputOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  function computeHash(input) {
    return SHA256(input).toString();
  }

  useEffect(() => {
    if (token !== "") {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.post("https://scanme-wkq3.onrender.com/users/sendmail", {
        email: email,
      });
      
      setOtp(response.data.otp);
      setCurrentPage(2);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter OTP");
      return;
    }
    
    if (parseInt(otp) === parseInt(SaveOTP)) {
      setCurrentPage(3);
      setError("");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Please fill all the fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const hashedPassword = computeHash(email + computeHash(password));
      
      await axios.post("https://scanme-wkq3.onrender.com/users/forgotpassword", {
        email,
        password: hashedPassword,
      });
      
      // Show success message before redirecting
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="left-panel">
        <div className="brand-container">
          <h1>AttendX</h1>
          <p>Reset your password to regain access to your account</p>
        </div>
      </div>
      
      <div className="right-panel">
        <div className="form-container">
          <div className="form-header">
            <h2>Reset Your Password</h2>
            <p className="subheading">Follow the steps below to reset your password</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {currentPage === 1 && (
            <form onSubmit={handleEmailSubmit} className="reset-form">
              <div className="step-indicator">
                <div className="step active">1</div>
                <div className="step-line"></div>
                <div className="step">2</div>
                <div className="step-line"></div>
                <div className="step">3</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}
          
          {currentPage === 2 && (
            <form onSubmit={handleOtpSubmit} className="reset-form">
              <div className="step-indicator">
                <div className="step completed">1</div>
                <div className="step-line completed"></div>
                <div className="step active">2</div>
                <div className="step-line"></div>
                <div className="step">3</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="help-text">Please check your email for the verification code</p>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => setCurrentPage(1)}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  Verify OTP
                </button>
              </div>
            </form>
          )}
          
          {currentPage === 3 && (
            <form onSubmit={handlePasswordSubmit} className="reset-form">
              <div className="step-indicator">
                <div className="step completed">1</div>
                <div className="step-line completed"></div>
                <div className="step completed">2</div>
                <div className="step-line completed"></div>
                <div className="step active">3</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => setCurrentPage(2)}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
          
          <div className="form-footer">
            <p>
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;