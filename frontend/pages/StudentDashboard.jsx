import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StudentDashboard.css";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [courses, setCourses] = useState([]); // ✅ Store enrolled courses
  const [showJoinClass, setShowJoinClass] = useState(false); // ✅ Control Join Class popup
  const [joinCode, setJoinCode] = useState(""); // ✅ Store input for joining course
  const navigate = useNavigate();

  // ✅ Fetch Student's Enrolled Courses
  const getStudentCourses = () => {
    axios
      .post("http://localhost:5050/students/getCourses", { token })
      .then((response) => {
        setCourses(response.data.courses || []); // Ensure it's always an array
      })
      .catch((error) => {
        console.log("Error fetching courses:", error);
        setCourses([]); // Prevents crashes if API fails
      });
  };

  // ✅ Handle Joining a Course
  const joinCourse = () => {
    if (!joinCode.trim()) return alert("Enter a valid invitation code!");

    axios
      .post("http://localhost:5050/students/joinCourse", {
        token,
        courseId: joinCode,
      })
      .then((response) => {
        alert("Joined course successfully!");
        getStudentCourses(); // Refresh course list
        setShowJoinClass(false); // Hide popup after joining
      })
      .catch((error) => {
        console.log("Error joining course:", error);
        alert("Failed to join course. Check your code.");
      });
  };

  // ✅ Redirect to Login if No Token
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      getStudentCourses();
    }
  }, [token]);

  return (
    <div className="dashboard-container">
      {/* ✅ Sidebar */}
      <div className="sidebar">
        <button className="join-class-btn" onClick={() => setShowJoinClass(true)}>
          Join Class
        </button>
      </div>

      {/* ✅ Main Content */}
      <div className="dashboard-main">
        <h2>Welcome to Your Student Dashboard</h2>

        {/* ✅ Join Class Popup */}
        {showJoinClass && (
          <div className="popup-overlay">
          <h3>Enter Invitation Code</h3>
          <input
            type="text"
            placeholder="Enter Invitation Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button className="join-btn" onClick={joinCourse}>Join</button>
          <button className="close-btn" onClick={() => setShowJoinClass(false)}>Cancel</button>
        </div>
       )}

        {/* ✅ List Enrolled Courses */}
        <div className="course-list">
          <h3>Your Enrolled Courses</h3>
          {courses.length > 0 ? (
            <ul>
              {courses.map((course, index) => (
                <li key={index}>
                  {course.courseName} ({course.courseId})
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not enrolled in any courses yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
