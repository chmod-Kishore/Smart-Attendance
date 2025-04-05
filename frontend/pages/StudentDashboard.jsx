import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/StudentDashboard.module.css";
import { clientServer } from "../src/config";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [invitationCode, setInvitationCode] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) return;
        const res = await clientServer.get(`/users/user?email=${userEmail}`);
        if (res.data.user) {
          localStorage.setItem("id", res.data.user._id);
          setStudentId(res.data.user._id);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!studentId) return;
      try {
        setIsLoading(true);
        const res = await clientServer.get(`/courses/student/${studentId}/classes`);
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

    try {
      await clientServer.post("/courses/join-class", {
        studentId,
        invitationCode,
      });

      setInvitationCode("");
      setShowJoinModal(false);

      const updatedCourses = await clientServer.get(`/courses/student/${studentId}/classes`);
      setCourses(updatedCourses.data);
    } catch (error) {
      console.error("Error joining class:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className={styles["dashboard-wrapper"]}>
      <aside className={styles.sidebar}>
        <h2>ScanMe</h2>
        <button onClick={() => setShowJoinModal(true)}>+ Join Class</button>
      </aside>

      <main className={styles["dashboard-content"]}>
        <h1>Your Courses</h1>
        {isLoading ? (
          <p>Loading courses...</p>
        ) : (
          <div className={styles["course-grid"]}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course._id}
                  className={styles["course-card"]}
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <h3>{course.courseName}</h3>
                  <p>Code: {course.courseCode}</p>
                  <button className={styles["view-btn"]}>View Details</button>
                </div>
              ))
            ) : (
              <p>No courses found.</p>
            )}
          </div>
        )}
      </main>

      {showJoinModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Join a Class</h2>
            <input
              type="text"
              placeholder="Enter Invitation Code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
            />
            <button onClick={handleJoinClass} className={styles["join-btn"]}>
              Join
            </button>
            <button onClick={() => setShowJoinModal(false)} className={styles["cancel-btn"]}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
