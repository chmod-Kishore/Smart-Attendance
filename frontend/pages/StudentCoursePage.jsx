import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { clientServer } from "../src/config";
import "../styles/StudentCoursePage.css";
import QRScanner from "../pages/QRScanner";

const StudentCoursePage = () => {
  const { id } = useParams(); // Course ID from URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await clientServer.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();

    // Fetch Student ID from Local Storage
    const storedStudentId = localStorage.getItem("id");
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, [id]);

  const handleCheckAttendance = (session) => {
    const studentAttendance = session.attendance.find(
      (att) => att.studentId._id === studentId
    );
    if (studentAttendance) {
      setAttendanceData({
        status: studentAttendance.status,
        name: studentAttendance.studentId.name,
        rollNo: studentAttendance.studentId.rollNo,
      });
    } else {
      setAttendanceData({
        status: "Not Attended",
        name: "N/A",
        rollNo: "N/A",
      });
    }
    setShowAttendanceModal(true);
  };

  const isScannerEnabled = (session) => {
    const now = new Date();
    const sessionStart = new Date(session.date);
    const sessionEnd = new Date(session.expiresAt);
    return now >= sessionStart && now <= sessionEnd;
  };

  if (loading) return <h1>Loading...</h1>;
  if (!course) return <h1>Course Not Found</h1>;

  return (
    <div className="course-container">
      <div className="course-details">
        <h1>{course.courseName}</h1>
        <p>
          <strong>Instructor:</strong> {course.teacherId.name}
        </p>
        <p>
          <strong>Course Code:</strong> {course.courseCode}
        </p>

        {/* Session Table */}
        <h2>Session Details</h2>
        {course.sessions.length > 0 ? (
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Radius (m)</th>
                <th>Duration (mins)</th>
                <th>Expires At</th>
                <th>Status</th>
                <th>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {course.sessions.map((session) => (
                <tr key={session._id}>
                  <td>{new Date(session.date).toLocaleString()}</td>
                  <td>{session.radius}</td>
                  <td>{session.duration}</td>
                  <td>{new Date(session.expiresAt).toLocaleString()}</td>
                  <td>
                    {session.attendance.find(
                      (att) => att.studentId._id === studentId
                    )?.status || "Not Marked"}
                  </td>
                  <td>
                    <button
                      disabled={!isScannerEnabled(session)}
                      onClick={() => {
                        setSessionId(session._id);
                        setShowQRScanner(true);
                      }}
                    >
                      📷
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No sessions available yet.</p>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Attendance Status</h2>
              <p>
                <strong>Name:</strong> {attendanceData.name}
              </p>
              <p>
                <strong>Roll No:</strong> {attendanceData.rollNo}
              </p>
              <p>
                <strong>Status:</strong> {attendanceData.status}
              </p>
              <button
                className="modal-btn"
                onClick={() => setShowAttendanceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <div className="qr-modal">
            <div className="modal-content">
              <h2>Scan QR Code</h2>
              <QRScanner sessionId={sessionId} studentId={studentId} />
              <button
                className="modal-btn"
                onClick={() => setShowQRScanner(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCoursePage;
