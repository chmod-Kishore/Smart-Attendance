import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { clientServer } from "../src/config";
import QRDisplay from "../pages/QRDisplay";
import "../styles/CourseDetails.css"; // Import styles

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSessions, setShowSessions] = useState(false); // ✅ Corrected toggle
  const [sessionDetails, setSessionDetails] = useState({
    courseId: "",
    latitude: "",
    longitude: "",
    duration: "",
    radius: "",
  });
  const [sessionId, setSessionId] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await clientServer.get(`/courses/${id}`);
        console.log("Course Data:", res.data);
        setCourse(res.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);
  const handleCheckAttendance = (session) => {
    setAttendanceData(session.attendance);
    setShowAttendanceModal(true);
  };
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSessionDetails((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to fetch location. Please enable GPS.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleCreateSession = async () => {
    if (
      !sessionDetails.courseId ||
      !sessionDetails.latitude ||
      !sessionDetails.longitude ||
      !sessionDetails.duration ||
      !sessionDetails.radius
    ) {
      return alert("All fields are required!");
    }

    try {
      const res = await axios.post(
        "https://scanme-wkq3.onrender.com/sessions/create",
        sessionDetails
      );
      alert("Session created successfully!");
      setSessionId(res.data.sessionId);
      setShowSessionModal(false);
      setShowQR(true);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session.");
    }
  };

  if (loading) return <h1 className="loading">Loading...</h1>;
  if (!course) return <h1 className="error">Course Not Found</h1>;

  return (
    <div className="dashboard-container">
      {/* Sidebar with Create Session Button */}
      <aside className="sidebar">
        <h2>ScanMe</h2>
        <div className="course-sidebar-details">
          <h3>{course.courseName}</h3>
          <p><strong>Course Code:</strong> {course.courseCode}</p>
          <p><strong>Invitation Code:</strong> {course.invitationCode}</p>
        </div>
        <button 
          className="create-session-btn"
          onClick={() => {
            fetchLocation(); // ✅ Fetch location before showing modal
            setSessionDetails((prev) => ({
              ...prev,
              courseId: course._id,
            }));
            setShowSessionModal(true);
          }}
        >
          Create Session
        </button>
        <button 
          className="session-details-btn"
          onClick={() => setShowSessions(!showSessions)} // ✅ Corrected toggle
        >
          {showSessions ? "Hide Session Details" : "Show Session Details"}
        </button>
      </aside>
  
      {/* Main Content */}
      <main className="dashboard-content">
        <h1 className="course-title">{course.courseName}</h1>
        <div className="course-info">
          <p><strong>Instructor:</strong> {course.teacherId.name}</p>
        </div>
  
        {/* Enrolled Students Table */}
        <h2 className="section-title">Enrolled Students</h2>
        {course.students.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Roll No</th>
                <th className="table-header">Department</th>
                <th className="table-header">Branch</th>
              </tr>
            </thead>
            <tbody>
              {course.students.map((student) => (
                <tr key={student._id} className="student-row">
                  <td className="student-data">{student.name}</td>
                  <td className="student-data">{student.rollNo}</td>
                  <td className="student-data">{student.dept}</td>
                  <td className="student-data">{student.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-students">No students enrolled yet.</p>
        )}
        {showSessions && (
          <div className="session-details">
            <h2>Session Details</h2>
            {course.sessions.length > 0 ? (
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Radius (m)</th>
                    <th>Duration (mins)</th>
                    <th>Expires At</th>
                    <th>Attendance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {course.sessions.map((session) => (
                    <tr key={session._id}>
                      <td>{new Date(session.date).toLocaleString()}</td>
                      <td>{session.radius}</td>
                      <td>{session.duration}</td>
                      <td>{new Date(session.expiresAt).toLocaleString()}</td>
                      <td>{session.attendance.length} students</td>
                      <td><button onClick={() => handleCheckAttendance(session)}>Check Attendance</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No sessions available yet.</p>
            )}
          </div>
        )}
      </main>
      {showSessionModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Session</h2>
            <p>Course ID: {sessionDetails.courseId}</p>
            <input
              type="text"
              className="input-field"
              placeholder="Session Duration (minutes)"
              value={sessionDetails.duration}
              onChange={(e) =>
                setSessionDetails((prev) => ({
                  ...prev,
                  duration: e.target.value,
                }))
              }
            />
            <input
              type="number"
              className="input-field"
              placeholder="Enter Radius (meters)"
              value={sessionDetails.radius}
              onChange={(e) =>
                setSessionDetails((prev) => ({
                  ...prev,
                  radius: e.target.value,
                }))
              }
            />
            <p className="location-info">Latitude: {sessionDetails.latitude || "Fetching..."}</p>
            <p className="location-info">Longitude: {sessionDetails.longitude || "Fetching..."}</p>
            <button className="modal-btn" onClick={handleCreateSession}>Create</button>
            <button className="modal-btn cancel" onClick={() => setShowSessionModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showAttendanceModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Attendance Details</h2>
            {attendanceData.length > 0 ? (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((att) => (
                    <tr key={att.studentId._id}>
                      <td>{att.studentId.name}</td>
                      <td>{att.studentId.rollNo}</td>
                      <td>{att.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No attendance records available.</p>
            )}
            <button className="modal-btn" onClick={() => setShowAttendanceModal(false)}>Close</button>
          </div>
        </div>
      )}
      {showQR && sessionId && (
        <div className="qr-modal">
          <div className="modal-content">
            <h2>Session QR Code</h2>
            <QRDisplay sessionId={sessionId} />
            <button className="modal-btn" onClick={() => setShowQR(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
