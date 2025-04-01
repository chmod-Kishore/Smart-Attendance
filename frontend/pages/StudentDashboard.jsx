import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";
import { clientServer } from "../src/config";

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showJoinSessionModal, setShowJoinSessionModal] = useState(false);
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false); // Reload flag to trigger re-fetch

  const navigate = useNavigate();

  // ✅ Fetch Student Details
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
  }, []);

  // ✅ Fetch Enrolled Classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!studentId) return;
      try {
        const res = await clientServer.get(
          `/courses/student/${studentId}/classes`
        );
        setClasses(res.data);
      } catch (error) {
        console.error("Error fetching enrolled classes:", error);
      }
    };

    fetchClasses();
  }, [studentId, reloadFlag]);  // Trigger fetch on studentId or reloadFlag change

  // ✅ Handle Joining Class
  const handleJoinClass = async () => {
    if (!courseName.trim() || !invitationCode.trim())
      return alert("Course Name and Invitation Code are required!");
    if (!studentId) return alert("Student ID not found!");

    try {
      const res = await axios.post(
        "https://scanme-wkq3.onrender.com/courses/join-class",
        {
          courseName,
          studentId,
          invitationCode,
        }
      );

      alert(res.data.message);
      setShowJoinClassModal(false);
      setClasses((prev) => [...prev, res.data.course]); // ✅ Update UI immediately
      setReloadFlag(!reloadFlag);  // Toggle the reloadFlag to trigger refetch
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
        <button onClick={() => setShowJoinClassModal(true)}>Join Class</button>
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
                onClick={() => navigate(`/student/course/${classItem._id}`)} // ✅ Navigate on click
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
      {showJoinClassModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Join a Class</h2>
            <input
              type="text"
              placeholder="Enter Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Invitation Code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
            />
            <button onClick={handleJoinClass}>Join</button>
            <button onClick={() => setShowJoinClassModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
