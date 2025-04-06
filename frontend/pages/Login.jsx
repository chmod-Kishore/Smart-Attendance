import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Login.module.css";
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
    let password = e.target.password.value;

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

  // useEffect(() => {
  //   if (token) {
  //     if (localStorage.getItem("type") === "teacher") {
  //       navigate("/teacher-dashboard");
  //     } else {
  //       navigate("/student-dashboard");
  //     }
  //   }
  // }, [token, navigate]);

  return (
    <div className={styles.loginMain}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
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

            <div className={styles.loginOptions}>
              <Link to="/forgot-password" className={styles.forgotPasswordLink}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className={styles.loginButton}>
              Sign In
            </button>
          </form>

          <div className={styles.loginFooter}>
            <p>
              Don't have an account?{" "}
              <Link to="/register" className={styles.signupLink}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
