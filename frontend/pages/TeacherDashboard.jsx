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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) return;
        const res = await clientServer.get(`/users/user?email=${userEmail}`);
        if (res.data.user) {
          localStorage.setItem("id", res.data.user._id);
          setTeacherId(res.data.user._id);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

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

  return (
    <div className={styles["dashboard-wrapper"]}>
      <aside className={styles.sidebar}>
        <h2>ScanMe</h2>
        <button onClick={() => setShowClassModal(true)}>+ Create Class</button>
      </aside>

      <main className={styles["dashboard-content"]}>
        <h1>Your Classes</h1>
        {isLoading ? (
          <p>Loading classes...</p>
        ) : (
          <div className={styles["class-grid"]}>
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <div
                  key={classItem._id}
                  className={styles["class-card"]}
                  onClick={() => navigate(`/course/${classItem._id}`)}
                >
                  <h3>{classItem.courseName}</h3>
                  <p>Code: {classItem.courseCode}</p>
                  <button className={styles["view-btn"]}>View Details</button>
                </div>
              ))
            ) : (
              <p>No classes found.</p>
            )}
          </div>
        )}
      </main>

      {showClassModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Create New Class</h2>
            <input
              type="text"
              placeholder="Enter Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Invitation Code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
            />
            <button onClick={handleCreateClass} className={styles["create-btn"]}>
              Create
            </button>
            <button onClick={() => setShowClassModal(false)} className={styles["cancel-btn"]}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
