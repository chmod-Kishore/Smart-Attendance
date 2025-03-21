import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TeacherDashboard.css"; // Reusing the same styles
import { clientServer } from "../src/config";

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [studentId, setStudentId] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch Student Details (on page load)
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
        console.error("Error fetching student details:", error);
      }
    };

    fetchUserDetails();
  }, [studentId,classes]);

  // ✅ Fetch Enrolled Classes (whenever studentId changes)
  useEffect(() => {
    const fetchClasses = async () => {
      if (!studentId) return;
      try {
        const res = await clientServer.get(`/courses/student/${studentId}/classes`);
        setClasses(res.data);
      } catch (error) {
        console.error("Error fetching enrolled classes:", error);
      }
    };

    fetchClasses();
  }, [studentId]);

  // ✅ Handle Join Class
  const handleJoinClass = async () => {
    if (!invitationCode.trim()) return alert("Invitation Code is required!");
    if (!studentId) return alert("Student ID not found!");

    try {
      const res = await clientServer.post("/courses/join-class", {
        studentId,
        invitationCode,
      });

      setClasses((prevClasses) => [...prevClasses, res.data.course]); // Add new class to state
      setInvitationCode(""); // Reset input field
      setShowModal(false);
      alert("Successfully joined the class!");
    } catch (error) {
      console.error("Error joining class:", error);
      alert(error.response?.data?.error || "Failed to join class");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>ScanMe</h2>
        <button onClick={() => setShowModal(true)}>+ Join Class</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1>Your Classes</h1>
        <div className="class-grid">
          {classes.length > 0 ? (
            classes.map((classItem) => (
              <div
                key={classItem._id}
                className="class-card"
                onClick={() => navigate(`/student/class/${classItem._id}`)}
              >
                <h3>{classItem.courseName}</h3>
                <p>Code: {classItem.courseCode}</p>
              </div>
            ))
          ) : (
            <p>No classes joined yet.</p>
          )}
        </div>
      </main>

      {/* Modal for Joining Class */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Join a Class</h2>
            <input
              type="text"
              placeholder="Enter Invitation Code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
            />
            <button onClick={handleJoinClass}>Join</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;