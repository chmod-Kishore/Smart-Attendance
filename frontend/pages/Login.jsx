import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let email = e.target.email.value;
    let password = e.target.password.value; // Send raw password

    if (email && password) {
      const formData = { email, password };
      try {
        const response = await axios.post(
          "https://scanme-wkq3.onrender.com/users/signin",
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
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in</p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                placeholder="Enter your email" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                <img
                  src={showPassword ? hide : see}
                  onClick={() => setShowPassword(!showPassword)}
                  alt="Toggle visibility"
                  className="password-toggle-icon"
                />
              </div>
            </div>

            <div className="login-options">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
          
          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;