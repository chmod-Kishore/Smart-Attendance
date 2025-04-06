import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { clientServer } from "../src/config";
import styles from "../styles/StudentCoursePage.module.css"; // Changed to module CSS
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
  const [refreshFlag, setRefreshFlag] = useState(false);
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
  }, [id, refreshFlag]);

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

  if (loading) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-spinner"]}></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Course Not Found</h3>
        <p>
          The course you're looking for doesn't exist or you don't have access
          to it.
        </p>
      </div>
    );
  }

  return (
    <div className={styles["dashboard-wrapper"]}>
      <aside className={styles.sidebar}>
        <div className={styles["sidebar-menu"]}>
          <a href="/student-dashboard" className={styles["menu-item"]}>
            <span className={styles["menu-icon"]}>
              <svg
                xwidth="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                mlns="http://www.w3.org/2000/svg"
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </span>
            <span>Back</span>
          </a>
        </div>
        <div className={styles["course-info-sidebar"]}>
          <span className={styles["course-code-badge"]}>
            {course.courseCode}
          </span>
          <h3>{course.courseName}</h3>
          <div className={styles["invitation-code"]}>
            <p>Instructor: {course.teacherId.name}</p>
          </div>
        </div>
      </aside>

      <main className={styles["dashboard-content"]}>
        <header className={styles["content-header"]}>
          <div className={styles["page-title"]}>
            <h1>Session Details</h1>
            <p className={styles["welcome-text"]}>
              View and manage your sessions for this course
            </p>
          </div>
          <div className={styles["instructor-info"]}>
            Instructor: {course.teacherId.name}
          </div>
        </header>

        <div className={styles["dashboard-body"]}>
          <div className={styles.section}>
            <h2 className={styles["section-title"]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Available Sessions
            </h2>

            {course.sessions.length > 0 ? (
              <div className={styles["table-container"]}>
                <table className={styles["data-table"]}>
                  <thead>
                    <tr>
                      <th>Date</th>

                      <th>Expires At</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.sessions.map((session) => {
                      const sessionActive = isScannerEnabled(session);
                      const attendanceStatus =
                        session.attendance.find(
                          (att) => att.studentId._id === studentId
                        )?.status || "Not Marked";

                      return (
                        <tr key={session._id}>
                          <td>{new Date(session.date).toLocaleString()}</td>

                          <td>
                            {new Date(session.expiresAt).toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`${styles["status-badge"]} ${
                                attendanceStatus === "Present"
                                  ? styles.present
                                  : styles.absent
                              }`}
                            >
                              {attendanceStatus}
                            </span>
                          </td>
                          <td>
                            {sessionActive ? (
                              <button
                                className={styles["action-btn"]}
                                onClick={() => {
                                  setSessionId(session._id);
                                  setShowQRScanner(true);
                                }}
                              >
                                Scan QR
                              </button>
                            ) : (
                              <button
                                className={`${styles["action-btn"]} ${styles["inactive-btn"]}`}
                                disabled
                              >
                                Scan QR
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles["empty-state-mini"]}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginBottom: "12px" }}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <p>No sessions available yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Attendance Status</h2>
            <div className={styles["student-info"]}>
              <p>
                <strong>Name:</strong> {attendanceData.name}
              </p>
              <p>
                <strong>Roll No:</strong> {attendanceData.rollNo}
              </p>
              <p>
                <strong>Status:</strong> {attendanceData.status}
              </p>
            </div>
            <div className={styles["modal-actions"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={() => setShowAttendanceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Scan QR Code</h2>
            <QRScanner
              sessionId={sessionId}
              studentId={studentId}
              onSuccess={() => {
                setShowQRScanner(false);
                setRefreshFlag((prev) => !prev);
              }}
            />
            <div className={styles["modal-actions"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={() => setShowQRScanner(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCoursePage;
