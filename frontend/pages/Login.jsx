import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SHA256 } from "crypto-js";
import axios from "axios";
import "../styles/Login.css";
import image512 from "../assets/logo512.png";
import see from "../assets/see.png";
import hide from "../assets/hide.png";

axios.defaults.withCredentials = true;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  function computeHash(input) {
    return SHA256(input).toString();
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let email = e.target.email.value;
    let password = e.target.password.value;

    if (email && password) {
      const formData = { email, password };
      try {
        const response = await axios.post(
          "http://localhost:5050/users/signin",
          formData
        );
        const { user, type, token } = response.data;

        localStorage.setItem("email", user.email);
        localStorage.setItem("name", user.name);
        localStorage.setItem("dob", user.dob);
        localStorage.setItem("type", type);
        localStorage.setItem("token", token);

        setToken(token);
        if (type === "student") {
          localStorage.setItem("rollNo", user.rollNo);
          localStorage.setItem("branch", user.branch);
          localStorage.setItem("dept", user.dept);
          navigate("/student-dashboard");
        } else {
          localStorage.setItem("dept", user.dept);
          navigate("/teacher-dashboard");
        }
      } catch (err) {
        alert("Invalid email or password");
        e.target.reset();
      }
    } else {
      alert("Please fill all fields");
      e.target.reset();
    }
  };

  useEffect(() => {
    if (token) {
      if (localStorage.getItem("type") === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    }
  }, [token]);

  return (
    <div className="login-main">
      <div className="login-left">
        <img alt="Full" src={image512} />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img alt="logo" src="/logo2.webp" />
          </div>
          <div className="login-center">
            <h2>Welcome back!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleLoginSubmit}>
              <input type="email" placeholder="Email" name="email" required />

              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  required
                />
                <img
                  src={showPassword ? hide : see}
                  onClick={() => setShowPassword(!showPassword)}
                  alt="Toggle visibility"
                  className="password-toggle-icon"
                />
              </div>

              <div className="login-center-options">
                <Link to="/forgot-password" className="forgot-pass-link">
                  Forgot password?
                </Link>
              </div>

              <div className="login-center-buttons">
                <button type="submit">Log In</button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
