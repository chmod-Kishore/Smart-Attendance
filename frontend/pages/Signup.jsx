import React, { useEffect, useState } from "react";
import "../styles/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import image512 from "../assets/logo512.png";
import { SHA256 } from "crypto-js";
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
          await axios.post("http://localhost:5050/users/signup", formData);
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
    let name = document.querySelector("input[name='name']").value;
    let email = document.querySelector("input[name='email']").value;

    if (name.length === 0 || email.length === 0) {
      alert("Please fill all the fields");
      return;
    }

    document.querySelector(".first-slide").style.display = "none";
    document.querySelector(".second-slide").style.display = "block";

    try {
      const res = await axios.post("http://localhost:5050/users/sendmail", {
        email,
      });
      setOtp(res.data.otp);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleThree = () => {
    let otp = document.querySelector("input[name='otp']").value;
    if (otp.length === 0) {
      alert("Please enter OTP");
    } else if (parseInt(otp) === parseInt(SaveOTP)) {
      document.querySelector(".second-slide").style.display = "none";
      document.querySelector(".third-slide").style.display = "block";
    } else {
      alert("Invalid OTP");
    }
  };

  const toggleFour = () => {
    document.querySelector(".third-slide").style.display = "none";
    document.querySelector(".password-slide").style.display = "block";
  };

  useEffect(() => {
    if (token !== "") {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className="register-main">
      <div className="register-left">
        <img alt="Full" src={image512} />
      </div>
      <div className="register-right">
        <div className="register-right-container">
          <div className="register-logo">
            <img alt="logo" src="/logo2.webp" />
          </div>
          <div className="register-center">
            <h2>Welcome to our website!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleRegisterSubmit}>
              {/* Step 1: Basic Details */}
              <div className="first-slide">
                <select
                  name="type"
                  id="type"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <input type="text" placeholder="Name" name="name" required />
                <input type="email" placeholder="Email" name="email" required />

                <button type="button" onClick={toggleTwo}>
                  Next
                </button>
              </div>

              {/* Step 2: OTP Verification */}
              <div className="second-slide" style={{ display: "none" }}>
                <input type="text" placeholder="OTP" name="otp" required />
                <button type="button" onClick={() => window.location.reload()}>
                  Edit Email
                </button>
                <button type="button" onClick={toggleThree}>
                  Submit
                </button>
              </div>

              {/* Step 3: Additional Details */}
              <div className="third-slide" style={{ display: "none" }}>
                {userType === "student" && (
                  <>
                    {/* Branch Selection */}

                    <input
                      type="text"
                      name="rollNo"
                      placeholder="Roll No"
                      required
                    />
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

                    {/* Roll No Input */}
                  </>
                )}

                {/* Department Selection */}

                <select name="dept" id="dept" required>
                  <option value="" disabled selected>
                    Select Department
                  </option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electronics">Electronics</option>
                </select>

                <input type="date" name="dob" required />

                <button type="button" onClick={toggleFour}>
                  Next
                </button>
              </div>

              {/* Step 4: Password Fields */}
              <div className="password-slide" style={{ display: "none" }}>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    required
                  />
                  <img
                    src={showPassword ? see : hide}
                    onClick={() => setShowPassword(!showPassword)}
                    alt="Toggle visibility"
                    className="password-toggle-icon"
                  />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  required
                />

                <button type="submit">Sign Up</button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#76ABAE" }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
