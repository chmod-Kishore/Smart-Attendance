import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import NewSession from "./NewSession";
import SessionDetails from "./SessionDetails";

axios.defaults.withCredentials = true;

const TeacherDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [sessionList, setSessionList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSessionDisplay, setSessionDisplay] = useState(false);
  const [currentSession, setCurrentSession] = useState("");
  const [showLogout, setShowLogout] = useState(false); // ✅ Using state instead of querySelector
  const navigate = useNavigate();

  // Update list of sessions
  const updateList = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5050/sessions/getSessions",
        { token }
      );
  
      // Ensure response.data.sessions is an array
      if (Array.isArray(response.data.sessions)) {
        setSessionList(response.data.sessions);
      } else {
        setSessionList([]); // Prevents errors if it's undefined/null
      }
    } catch (err) {
      console.error(err);
      setSessionList([]); // Ensures sessionList is always an array, even on error
    }
  };
  
  const toggleSessionDetails = (sessionId) => {
    // Get the session details that has session_id = sessionId
    setCurrentSession(
      sessionList.find((session) => session.session_id === sessionId)
    );
    setSessionDisplay(!isSessionDisplay);
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      updateList();
      setShowLogout(true); // ✅ Now using state instead of querySelector
    }
  }, [token]);

  const FlashCard = ({ session }) => (
    <div
      className="flashcard"
      onClick={() => toggleSessionDetails(session.session_id)}
    >
      <div className="front">
        <h4>{session.name}</h4>
      </div>
    </div>
  );

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
