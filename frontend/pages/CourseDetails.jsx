import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { clientServer } from "../src/config";
import QRDisplay from "../pages/QRDisplay";
import styles from "../styles/CourseDetails.module.css"; // Changed to module CSS

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
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
  const [showUpdateAttendanceModal, setShowUpdateAttendanceModal] =
    useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [newStatus, setNewStatus] = useState("Present");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

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

  useEffect(() => {
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
    if (isCreatingSession) return; // Prevent duplicate clicks
    setIsCreatingSession(true); // Disable the button

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
    } finally {
      setIsCreatingSession(false); // Re-enable the button
    }
  };

  const handleUpdateAttendance = async () => {
    if (!selectedSessionId || !selectedStudent || !newStatus) {
      return alert("All fields are required!");
    }

    try {
      console.log(selectedSessionId);
      console.log(selectedStudent._id);
      console.log(newStatus);
      const res = await axios.patch(
        "https://scanme-wkq3.onrender.com/sessions/update-attendance-status",
        {
          sessionId: selectedSessionId,
          studentId: selectedStudent._id,
          status: newStatus,
        }
      );
      alert("Attendance status updated successfully!");
      setShowUpdateAttendanceModal(false);
      fetchCourseDetails(); // Refresh course details
    } catch (error) {
      console.error("Error updating attendance status:", error);
      alert("Failed to update attendance status.");
    }
  };

  if (loading)
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-spinner"]}></div>
        <p>Loading course details...</p>
      </div>
    );

  if (!course)
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
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>Course Not Found</h3>
        <p>
          The course you're looking for doesn't exist or you don't have access
          to it.
        </p>
      </div>
    );

  return (
    <div className={styles["dashboard-wrapper"]}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles["sidebar-menu"]}>
          <a href="/teacher-dashboard" className={styles["menu-item"]}>
            <span className={styles["menu-icon"]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
          <h3>{course.courseName}</h3>
          <div className={styles["course-code-badge"]}>
            Course Code: {course.courseCode}
          </div>
          <div className={styles["invitation-code"]}>
            Invitation Code: {course.invitationCode}
          </div>
        </div>

        <div className={styles["sidebar-footer"]}>
          <button
            onClick={() => {
              fetchLocation();
              setSessionDetails((prev) => ({
                ...prev,
                courseId: course._id,
              }));
              setShowSessionModal(true);
            }}
            className={styles["create-session-btn"]}
          >
            <span className={styles["btn-icon"]}>+</span>
            <span>Create Session</span>
          </button>

          <button
            className={styles["toggle-sessions-btn"]}
            onClick={() => {
              fetchCourseDetails();
              setShowSessions(!showSessions);
            }}
          >
            {showSessions ? "Hide Sessions" : "Show Sessions"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles["dashboard-content"]}>
        <header className={styles["content-header"]}>
          <div className={styles["page-title"]}>
            <p className={styles["welcome-text"]}>Course Details</p>
            <h1>{course.courseName}</h1>
          </div>
          <div className={styles["instructor-info"]}>
            <span>Instructor: {course.teacherId.name}</span>
          </div>
        </header>

        <div className={styles["dashboard-body"]}>
          {/* Enrolled Students */}
          <div className={styles["section"]}>
            <h2 className={styles["section-title"]}>Enrolled Students</h2>
            {course.students.length > 0 ? (
              <div className={styles["table-container"]}>
                <table className={styles["data-table"]}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll No</th>

                      <th>Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.students.map((student) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.rollNo}</td>

                        <td>{student.branch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles["empty-state-mini"]}>
                <p>No students enrolled yet.</p>
              </div>
            )}
          </div>

          {/* Session Details (conditionally displayed) */}
          {showSessions && (
            <div className={styles["section"]}>
              <h2 className={styles["section-title"]}>Session Details</h2>
              {course.sessions.length > 0 ? (
                <div className={styles["table-container"]}>
                  <table className={styles["data-table"]}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Radius (m)</th>
                        <th>Duration (mins)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.sessions.map((session) => (
                        <tr key={session._id}>
                          <td>{new Date(session.date).toLocaleString()}</td>
                          <td>{session.radius}</td>
                          <td>{session.duration}</td>
                          <td>
                            <button
                              className={styles["action-btn"]}
                              onClick={() => handleCheckAttendance(session)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles["empty-state-mini"]}>
                  <p>No sessions available yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Session Modal */}
      {showSessionModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Create New Session</h2>
            <p>Setting up attendance session for {course.courseName}</p>

            <input
              type="text"
              className={styles["code-input"]}
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
              className={styles["code-input"]}
              placeholder="Enter Radius (meters)"
              value={sessionDetails.radius}
              onChange={(e) =>
                setSessionDetails((prev) => ({
                  ...prev,
                  radius: e.target.value,
                }))
              }
            />

            <div className={styles["location-info"]}>
              <div>Latitude: {sessionDetails.latitude || "Fetching..."}</div>
              <div>Longitude: {sessionDetails.longitude || "Fetching..."}</div>
            </div>

            <div className={styles["modal-actions"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={() => setShowSessionModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles["join-btn"]}
                onClick={handleCreateSession}
                disabled={isCreatingSession}
              >
                {isCreatingSession ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Attendance Details</h2>

            {attendanceData.length > 0 ? (
              <div className={styles["table-container"]}>
                <table className={styles["data-table"]}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll No</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((att) => (
                      <tr key={att.studentId._id}>
                        <td>{att.studentId.name}</td>
                        <td>{att.studentId.rollNo}</td>
                        <td>
                          <span
                            className={`${styles["status-badge"]} ${
                              styles[att.status.toLowerCase()]
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles["action-btn"]}
                            onClick={() => {
                              setSelectedStudent(att.studentId);
                              setSelectedSessionId(
                                course.sessions.find((s) =>
                                  s.attendance.some(
                                    (a) => a.studentId._id === att.studentId._id
                                  )
                                )._id
                              );
                              setShowUpdateAttendanceModal(true);
                            }}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No attendance records available.</p>
            )}

            <div className={styles["modal-actions"]}>
              <button
                className={styles["join-btn"]}
                onClick={() => setShowAttendanceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Attendance Modal */}
      {showUpdateAttendanceModal && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Update Attendance Status</h2>

            <div className={styles["student-info"]}>
              <p>
                Student: {selectedStudent?.name} ({selectedStudent?.rollNo})
              </p>
            </div>

            <select
              className={styles["status-select"]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>

            <div className={styles["modal-actions"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={() => setShowUpdateAttendanceModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles["join-btn"]}
                onClick={handleUpdateAttendance}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && sessionId && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <h2>Attendance QR Code</h2>
            <div className={styles["qr-container"]}>
              <QRDisplay sessionId={sessionId} />
            </div>

            <div className={styles["modal-actions"]}>
              <button
                className={styles["join-btn"]}
                onClick={() => setShowQR(false)}
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

export default CourseDetails;
