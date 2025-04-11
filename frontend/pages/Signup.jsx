import React, { useEffect, useState } from "react";
import styles from "../styles/Signup.module.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import see from "../assets/see.png";
import hide from "../assets/hide.png";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [SaveOTP, setOtp] = useState(
    Math.floor(100000 + Math.random() * 900000) || 0
  );
  const [userType, setUserType] = useState("student");
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    let name = e.target.name.value;
    let email = e.target.email.value;
    let password = e.target.password.value;
    let confirmPassword = e.target.confirmPassword.value;
    let dob = e.target.dob.value;
    let dept = e.target.dept.value;

    // Student-specific fields
    let rollNo = userType === "student" ? e.target.rollNo.value : null;
    let branch = userType === "student" ? e.target.branch.value : null;

    if (password.length > 0 && confirmPassword.length > 0) {
      if (password === confirmPassword) {
        const formData = {
          name,
          email,
          password,
          dob,
          dept,
          ...(userType === "student" && { rollNo, branch }),
          type: userType,
        };

        try {
          await axios.post(
            "https://scanme-wkq3.onrender.com/users/signup",
            formData
          );
          navigate("/login");
        } catch (err) {
          console.log(err);
        }
      } else {
        alert("Passwords do not match");
      }
    } else {
      alert("Please fill all the fields");
    }
  };

  const toggleTwo = async () => {
    let name = document.querySelector(`input[name='name']`).value;
    let email = document.querySelector(`input[name='email']`).value;

    if (name.length === 0 || email.length === 0) {
      alert("Please fill all the fields");
      return;
    }

    document.querySelector(`.${styles.firstSlide}`).style.display = "none";
    document.querySelector(`.${styles.secondSlide}`).style.display = "block";

    try {
      const res = await axios.post(
        "https://scanme-wkq3.onrender.com/users/sendmail",
        {
          email,
          type: "registration",
        }
      );
      setOtp(res.data.otp);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleThree = () => {
    let otp = document.querySelector(`input[name='otp']`).value;
    if (otp.length === 0) {
      alert("Please enter OTP");
    } else if (parseInt(otp) === parseInt(SaveOTP)) {
      document.querySelector(`.${styles.secondSlide}`).style.display = "none";
      document.querySelector(`.${styles.thirdSlide}`).style.display = "block";
    } else {
      alert("Invalid OTP");
    }
  };

  const toggleFour = () => {
    document.querySelector(`.${styles.thirdSlide}`).style.display = "none";
    document.querySelector(`.${styles.passwordSlide}`).style.display = "block";
  };

  useEffect(() => {
    if (token !== "") {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className={styles.signupMain}>
      <div className={styles.signupContainer}>
        <div className={styles.signupCard}>
          <div className={styles.signupHeader}>
            <h2>Welcome to AttendX!</h2>
            <p>Please enter your details</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className={styles.signupForm}>
            {/* Step 1: Basic Details */}
            <div className={styles.firstSlide}>
              <div className={styles.formGroup}>
                <label htmlFor="type">User Type</label>
                <select
                  name="type"
                  id="type"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  name="name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  name="email"
                  required
                />
              </div>

              <button
                type="button"
                className={styles.signupButton}
                onClick={toggleTwo}
              >
                Next
              </button>
            </div>

            {/* Step 2: OTP Verification */}
            <div className={styles.secondSlide} style={{ display: "none" }}>
              <div className={styles.formGroup}>
                <label htmlFor="otp">OTP Verification</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter OTP"
                  name="otp"
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => window.location.reload()}
                >
                  Edit Email
                </button>
                <button
                  type="button"
                  className={styles.signupButton}
                  onClick={toggleThree}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Step 3: Additional Details */}
            <div className={styles.thirdSlide} style={{ display: "none" }}>
              {userType === "student" && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="rollNo">Roll No</label>
                    <input
                      type="text"
                      id="rollNo"
                      name="rollNo"
                      placeholder="Enter your roll number"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="branch">Branch</label>
                    <select name="branch" id="branch" required>
                      <option value="" disabled selected>
                        Select Branch
                      </option>
                      <option value="CSE">CSE</option>
                      <option value="CSE-AI">CSE-AI</option>
                      <option value="MECH">MECH</option>
                      <option value="ECE">ECE</option>
                      <option value="CSE-DD">CSE-DD</option>
                    </select>
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="dept">Department</label>
                <select name="dept" id="dept" required>
                  <option value="" disabled selected>
                    Select Department
                  </option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dob">Date of Birth</label>
                <input type="date" id="dob" name="dob" required />
              </div>

              <button
                type="button"
                className={styles.signupButton}
                onClick={toggleFour}
              >
                Next
              </button>
            </div>

            {/* Step 4: Password Fields */}
            <div className={styles.passwordSlide} style={{ display: "none" }}>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    name="password"
                    required
                  />
                  <img
                    src={showPassword ? see : hide}
                    onClick={() => setShowPassword(!showPassword)}
                    alt="Toggle visibility"
                    className={styles.passwordToggleIcon}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    name="confirmPassword"
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.signupButton}>
                Sign Up
              </button>
            </div>
          </form>

          <div className={styles.signupFooter}>
            <p>
              Already have an account?{" "}
              <Link to="/login" className={styles.loginLink}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
