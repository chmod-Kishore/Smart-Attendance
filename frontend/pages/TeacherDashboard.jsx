import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/TeacherDashboard.module.css";
import { clientServer } from "../src/config";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [teacherId, setTeacherId] = useState(null);
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
          setTeacherId(res.data.user._id);
          setUserName(res.data.user.name || userEmail.split("@")[0]);
          // Store name in localStorage for Nav component
          localStorage.setItem("name", res.data.user.name || userEmail.split("@")[0]);
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
    const fetchClasses = async () => {
      if (!teacherId) return;
      try {
        setIsLoading(true);
        const res = await clientServer.get(`/courses/teacher/${teacherId}/classes`);
        setClasses(res.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, [teacherId]);

  const handleCreateClass = async () => {
    if (!teacherId) return alert("Teacher ID not found");
    if (!courseName.trim() || !courseCode.trim() || !invitationCode.trim())
      return alert("All fields are required!");

    try {
      await clientServer.post("/courses/create-class", {
        teacherId,
        courseName,
        courseCode,
        invitationCode,
      });

      setCourseName("");
      setCourseCode("");
      setInvitationCode("");
      setShowClassModal(false);

      const updatedClasses = await clientServer.get(`/courses/teacher/${teacherId}/classes`);
      setClasses(updatedClasses.data);
    } catch (error) {
      console.error("Error creating class:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  const renderEmptyState = () => (
    <div className={styles["empty-state"]}>
      <div className={styles["empty-icon"]}>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </div>
      <h3>No Classes Yet</h3>
      <p>Create your first class to get started</p>
      <button 
        onClick={() => setShowClassModal(true)} 
        className={styles["create-empty-btn"]}
      >
        Create Your First Class
      </button>
    </div>
  );

  return (
    <div className={styles["dashboard-wrapper"]}>
      <aside className={styles.sidebar}>
        <div className={styles["sidebar-menu"]}>
          <a href="/dashboard" className={`${styles["menu-item"]} ${styles.active}`}>
            <span className={styles["menu-icon"]}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </span>
            <span>Attendance</span>
          </a>
          
          <a href="/profile" className={styles["menu-item"]}>
            <span className={styles["menu-icon"]}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span>Profile</span>
          </a>
        </div>
        
        <div className={styles["sidebar-footer"]}>
          <button 
            onClick={() => setShowClassModal(true)} 
            className={styles["create-btn"]}
          >
            <span className={styles["btn-icon"]}>+</span>
            <span>Create Class</span>
          </button>
        </div>
      </aside>

      <main className={styles["dashboard-content"]}>
        <header className={styles["content-header"]}>
          <div className={styles["page-title"]}>
            <h1>Your Classes</h1>
            <p className={styles["welcome-text"]}>Welcome back, {userName}!</p>
          </div>
        </header>
        
        {isLoading ? (
          <div className={styles["loading-container"]}>
            <div className={styles["loading-spinner"]}></div>
            <p>Loading your classes...</p>
          </div>
        ) : (
          <div className={styles["dashboard-body"]}>
            {classes.length > 0 ? (
              <div className={styles["class-grid"]}>
                {classes.map((classItem) => (
                  <div
                    key={classItem._id}
                    className={styles["class-card"]}
                    onClick={() => navigate(`/course/${classItem._id}`)}
                  >
                    <div className={styles["class-color-indicator"]}></div>
                    <div className={styles["class-content"]}>
                      <h3>{classItem.courseName}</h3>
                      <p className={styles["course-code"]}>Code: {classItem.courseCode}</p>
                      <div className={styles["class-details"]}>
                        <p className={styles["invitation-code"]}>Invitation: {classItem.invitationCode}</p>
                        <p className={styles["student-count"]}>
                          {classItem.studentCount || 0} Students
                        </p>
                      </div>
                      <button className={styles["view-btn"]}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                <div 
                  className={`${styles["class-card"]} ${styles["add-class-card"]}`}
                  onClick={() => setShowClassModal(true)}
                >
                  <div className={styles["add-class-content"]}>
                    <div className={styles["add-icon"]}>+</div>
                    <p>Create New Class</p>
                  </div>
                </div>
              </div>
            ) : (
              renderEmptyState()
            )}
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      {showClassModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Create New Class</h2>
            <p>Fill in the details for your new class</p>
            <input
              type="text"
              placeholder="Enter Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className={styles["code-input"]}
            />
            <input
              type="text"
              placeholder="Enter Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
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
              <button onClick={() => setShowClassModal(false)} className={styles["cancel-btn"]}>
                Cancel
              </button>
              <button onClick={handleCreateClass} className={styles["create-btn"]}>
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;