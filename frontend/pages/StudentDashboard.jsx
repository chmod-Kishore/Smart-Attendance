// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/TeacherDashboard.css";
// import { clientServer } from "../src/config";
// import QRScanner from "../pages/QRScanner";

// const StudentDashboard = () => {
//   const [classes, setClasses] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [invitationCode, setInvitationCode] = useState("");
//   const [studentId, setStudentId] = useState(null);
//   const navigate = useNavigate();

//   // ✅ Fetch Student Details
//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const userEmail = localStorage.getItem("email");
//         if (!userEmail) return;

//         const res = await clientServer.get(`/users/user?email=${userEmail}`);
//         if (res.data.user) {
//           localStorage.setItem("id", res.data.user._id);
//           setStudentId(res.data.user._id);
//         }
//       } catch (error) {
//         console.error("Error fetching student details:", error);
//       }
//     };

//     fetchUserDetails();
//   }, []);

//   // ✅ Fetch Enrolled Classes
//   useEffect(() => {
//     const fetchClasses = async () => {
//       if (!studentId) return;
//       try {
//         const res = await clientServer.get(
//           `/courses/student/${studentId}/classes`
//         );
//         setClasses(res.data);
//       } catch (error) {
//         console.error("Error fetching enrolled classes:", error);
//       }
//     };

//     fetchClasses();
//   }, [studentId]);

//   // ✅ Handle Join Class
//   const handleJoinClass = async () => {
//     if (!invitationCode.trim()) return alert("Invitation Code is required!");
//     if (!studentId) return alert("Student ID not found!");

//     try {
//       const res = await clientServer.post("/courses/join-class", {
//         studentId,
//         invitationCode,
//       });

//       setClasses((prevClasses) => [...prevClasses, res.data.course]);
//       setInvitationCode("");
//       setShowModal(false);
//       alert("Successfully joined the class!");
//     } catch (error) {
//       console.error("Error joining class:", error);
//       alert(error.response?.data?.error || "Failed to join class");
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Sidebar */}
//       <aside className="sidebar">
//         <h2>ScanMe</h2>
//         <button onClick={() => setShowModal(true)}>+ Join Class</button>
//       </aside>

//       {/* Main Content */}
//       <main className="dashboard-content">
//         <h1>Your Classes</h1>
//         <div className="class-grid">
//           {classes.length > 0 ? (
//             classes.map((classItem) => (
//               <div key={classItem._id} className="class-card">
//                 <h3>{classItem.courseName}</h3>
//                 <p>Code: {classItem.courseCode}</p>

//                 {/* ✅ Join Session Button */}
//                 <button
//                   onClick={() => navigate(`/student/session/${classItem._id}`)}
//                 >
//                   Join Session
//                 </button>

//                 {/* ✅ QR Scanner for Attendance */}
//                 <QRScanner sessionId={classItem._id} />
//               </div>
//             ))
//           ) : (
//             <p>No classes joined yet.</p>
//           )}
//         </div>
//       </main>

//       {/* Modal for Joining Class */}
//       {showModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h2>Join a Class</h2>
//             <input
//               type="text"
//               placeholder="Enter Invitation Code"
//               value={invitationCode}
//               onChange={(e) => setInvitationCode(e.target.value)}
//             />
//             <button onClick={handleJoinClass}>Join</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentDashboard;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRScanner from "../pages/QRScanner";
import "../styles/StudentDashboard.css";
import { clientServer } from "../src/config";

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [qrCode, setQrCode] = useState(null); // ✅ Store fetched QR Code
  const [showQRScanner, setShowQRScanner] = useState(false); // ✅ Show scanner

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
  }, [studentId]);

  // ✅ Handle Join Session
  const handleJoinSession = async () => {
    if (!sessionId.trim()) return alert("Session ID is required!");
    if (!studentId) return alert("Student ID not found!");

    try {
      const res = await axios.post("http://localhost:5050/sessions/join", {
        studentId,
        sessionId,
      });

      setQrCode(res.data.qrCode); // ✅ Store QR Code
      setShowQRScanner(true); // ✅ Enable QR Scanner
      alert("Joined session successfully!");
    } catch (error) {
      console.error("Error joining session:", error);
      alert(error.response?.data?.error || "Failed to join session");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>ScanMe</h2>
        <button onClick={() => setShowJoinModal(true)}>Join Session</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1>Your Classes</h1>
        <div className="class-grid">
          {classes.length > 0 ? (
            classes.map((classItem) => (
              <div key={classItem._id} className="class-card">
                <h3>{classItem.courseName}</h3>
                <p>Code: {classItem.courseCode}</p>
              </div>
            ))
          ) : (
            <p>No classes joined yet.</p>
          )}
        </div>
      </main>

      {/* Modal for Joining Session */}
      {showJoinModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Join a Session</h2>
            <input
              type="text"
              placeholder="Enter Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
            <button onClick={handleJoinSession}>Join</button>
            <button onClick={() => setShowJoinModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {qrCode && (
        <div className="qr-modal">
          <div className="modal-content">
            <h2>Session QR Code</h2>
            <img src={qrCode} alt="Session QR Code" />
          </div>
        </div>
      )}

      {/* QR Scanner for Attendance */}
      {showQRScanner && (
        <QRScanner sessionId={sessionId} studentId={studentId} />
      )}
    </div>
  );
};

export default StudentDashboard;
