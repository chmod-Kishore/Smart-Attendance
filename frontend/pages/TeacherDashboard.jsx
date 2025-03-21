import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/TeacherDashboard.css";

const TeacherDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [sessionList, setSessionList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSessionDisplay, setSessionDisplay] = useState(false);
  const [currentSession, setCurrentSession] = useState("");
  const [showLogout, setShowLogout] = useState(false); // ✅ Using state instead of querySelector
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/teacher/classes"
        );
        setClasses(res.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  const handleCreateClass = async () => {
    if (!courseName.trim() || !courseCode.trim()) {
      return alert("Course Name and Course Code cannot be empty!");
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/teacher/create-class",
        {
          courseName,
          courseCode,
        }
      );
      setClasses([...classes, res.data]);
      setCourseName("");
      setCourseCode("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  return (
    <div className="dashboard-main">
      <div className="row1">
        <div className="heading">
          <h2>Your Sessions</h2>
        </div>
        <div className="createbtncol">
          <button onClick={togglePopup} className="createbtn">
            Create Session
          </button>
        </div>
      </div>

      {/* ✅ Conditionally show Logout Button */}
      {showLogout && <button className="logout">Logout</button>}

      <div className="session-list">
        {sessionList.length > 0 ? (
          sessionList.map((session, index) => (
            <div key={index + session.session_id} className="flashcard">
              <FlashCard session={session} />
            </div>
          ))
        ) : (
          <p>No sessions found</p>
        )}
      </div>

      {isSessionDisplay && (
        <div className="popup-overlay">
          <SessionDetails
            currentSession={currentSession}
            toggleSessionDetails={toggleSessionDetails}
          />
        </div>
      )}

      {isOpen && (
        <div className="popup-overlay">
          <NewSession togglePopup={togglePopup} />
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
