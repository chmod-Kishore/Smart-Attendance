import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/StudentDashboard.module.css";
import { clientServer } from "../src/config";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [invitationCode, setInvitationCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) {
          navigate("/login");
          return;
        }
        const res = await clientServer.get(`/users/user?email=${userEmail}`);
        if (res.data.user) {
          localStorage.setItem("id", res.data.user._id);
          setStudentId(res.data.user._id);
          setUserName(res.data.user.name || userEmail.split("@")[0]);
          localStorage.setItem(
            "name",
            res.data.user.name || userEmail.split("@")[0]
          );
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to load user information. Please try logging in again.");
        navigate("/login");
      }
    };
    fetchUserDetails();
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!studentId) return;
      try {
        setIsLoading(true);
        const res = await clientServer.get(
          `/courses/student/${studentId}/classes`
        );
        setCourses(res.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [studentId]);

  const handleJoinClass = async () => {
    if (!studentId) return alert("Student ID not found");
    if (!invitationCode.trim()) return alert("Invitation code is required");
    if (!courseName.trim()) return alert("Course name is required");

    try {
      await clientServer.post("/courses/join-class", {
        studentId,
        invitationCode,
        courseName,
      });

      setInvitationCode("");
      setCourseName("");
      setShowJoinModal(false);

      const updatedCourses = await clientServer.get(
        `/courses/student/${studentId}/classes`
      );
      setCourses(updatedCourses.data);
    } catch (error) {
      console.error("Error joining class:", error);
      alert(error.response?.data?.error || "Invalid data or server error");
    }
  };

  const renderEmptyState = () => (
    <div className={styles["empty-state"]}>
      <div className={styles["empty-icon"]}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <h3>No Classes Yet</h3>
      <p>Join a class using an invitation code to get started</p>
      <button
        onClick={() => setShowJoinModal(true)}
        className={styles["join-empty-btn"]}
      >
        Join Your First Class
      </button>
    </div>
  );

  return (
    <div className={styles["dashboard-wrapper"]}>
      <aside className={styles.sidebar}>
        <div className={styles["sidebar-menu"]}>
          <a
            href="/dashboard"
            className={`${styles["menu-item"]} ${styles.active}`}
          >
            <span className={styles["menu-icon"]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </span>
            <span>Dashboard</span>
          </a>

          <a href="/attendance" className={styles["menu-item"]}>
            <span className={styles["menu-icon"]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </span>
            <span>Attendance</span>
          </a>

          <a href="/profile" className={styles["menu-item"]}>
            <span className={styles["menu-icon"]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span>Profile</span>
          </a>
        </div>

        <div className={styles["sidebar-footer"]}>
          <button
            onClick={() => setShowJoinModal(true)}
            className={styles["join-btn"]}
          >
            <span className={styles["btn-icon"]}>+</span>
            <span>Join Class</span>
          </button>
        </div>
      </aside>

      <main className={styles["dashboard-content"]}>
        <header className={styles["content-header"]}>
          <div className={styles["page-title"]}>
            <p className={styles["welcome-text"]}>Welcome back, {userName}!</p>
            <h1 style={{ marginTop: "5px" }}>Your Classes</h1>
          </div>
        </header>

        {isLoading ? (
          <div className={styles["loading-container"]}>
            <div className={styles["loading-spinner"]}></div>
            <p>Loading your classes...</p>
          </div>
        ) : (
          <div className={styles["dashboard-body"]}>
            {courses.length > 0 ? (
              <div className={styles["course-grid"]}>
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className={styles["course-card"]}
                    onClick={() => navigate(`/student/course/${course._id}`)}
                  >
                    <div className={styles["course-color-indicator"]}></div>
                    <div className={styles["course-content"]}>
                      <h3>{course.courseName}</h3>
                      <p className={styles["course-code"]}>
                        Code: {course.courseCode}
                      </p>
                      <div className={styles["course-details"]}></div>
                      <button className={styles["view-btn"]}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  className={`${styles["course-card"]} ${styles["add-class-card"]}`}
                  onClick={() => setShowJoinModal(true)}
                >
                  <div className={styles["add-class-content"]}>
                    <div className={styles["add-icon"]}>+</div>
                    <p>Join New Class</p>
                  </div>
                </div>
              </div>
            ) : (
              renderEmptyState()
            )}
          </div>
        )}
      </main>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Join a Class</h2>
            <p>Enter the details provided by your instructor</p>
            <input
              type="text"
              placeholder="Enter Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className={styles["code-input"]}
            />
            <input
              type="text"
              placeholder="Enter Invitation Code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className={styles["code-input"]}
            />
            <div className={styles["modal-actions"]}>
              <button
                onClick={() => setShowJoinModal(false)}
                className={styles["cancel-btn"]}
              >
                Cancel
              </button>
              <button onClick={handleJoinClass} className={styles["join-btn"]}>
                Join Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
