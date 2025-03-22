// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../styles/TeacherDashboard.css";
// import { clientServer } from "../src/config";

// const TeacherDashboard = () => {
//   const [classes, setClasses] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [courseName, setCourseName] = useState("");
//   const [courseCode, setCourseCode] = useState("");
//   const [invitationCode, setInvitationCode] = useState(""); // ✅ New state for invitationCode
//   const [teacherId, setTeacherId] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const userEmail = localStorage.getItem("email");
//         if (!userEmail) return;

//         const res = await axios.get(
//           `http://localhost:5050/users/user?email=${userEmail}`
//         );
//         if (res.data.user) {
//           localStorage.setItem("id", res.data.user._id);
//           setTeacherId(res.data.user._id);
//         }
//       } catch (error) {
//         console.error("Error fetching user details:", error);
//       }
//     };

//     fetchUserDetails();
//   }, [teacherId]);

//   useEffect(() => {
//     const fetchClasses = async () => {
//       if (!teacherId) return;
//       try {
//         const res = await clientServer.get(
//           `/courses/teacher/${teacherId}/classes`
//         );
//         setClasses(res.data);
//       } catch (error) {
//         console.error("Error fetching classes:", error);
//       }
//     };
//     fetchClasses();
//   }, [teacherId,classes]);

//   const handleCreateClass = async () => {
//     if (!courseName.trim() || !courseCode.trim() || !invitationCode.trim()) {
//       return alert("All fields are required!");
//     }
//     if (!teacherId) return alert("Teacher ID not found!");

//     try {
//       const res = await axios.post(
//         "http://localhost:5050/courses/create-class",
//         {
//           teacherId,
//           courseName,
//           courseCode,
//           invitationCode, // ✅ Sending invitationCode in the request
//         }
//       );

//       setClasses((prevClasses) => [...prevClasses, res.data]);
//       setCourseName("");
//       setCourseCode("");
//       setInvitationCode(""); // ✅ Reset after submission
//       setShowModal(false);
//     } catch (error) {
//       console.error("Error creating class:", error);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Sidebar */}
//       <aside className="sidebar">
//         <h2>ScanMe</h2>
//         <button onClick={() => setShowModal(true)}>+ Create Class</button>
//       </aside>

//       {/* Main Content */}
//       <main className="dashboard-content">
//         <h1>Your Classes</h1>
//         <div className="class-grid">
//           {classes.length > 0 ? (
//             classes.map((classItem) => (
//               <div
//                 key={classItem._id}
//                 className="class-card"
//                 onClick={() => navigate(`/teacher/class/${classItem._id}`)}
//               >
//                 <h3>{classItem.courseName}</h3>
//                 <p>Code: {classItem.courseCode}</p>
//               </div>
//             ))
//           ) : (
//             <p>No classes created yet.</p>
//           )}
//         </div>
//       </main>

//       {/* Modal for Class Creation */}
//       {showModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h2>Create New Class</h2>
//             <input
//               type="text"
//               placeholder="Enter Course Name"
//               value={courseName}
//               onChange={(e) => setCourseName(e.target.value)}
//             />
//             <input
//               type="text"
//               placeholder="Enter Course Code"
//               value={courseCode}
//               onChange={(e) => setCourseCode(e.target.value)}
//             />
//             <input
//               type="text"
//               placeholder="Enter Invitation Code"
//               value={invitationCode}
//               onChange={(e) => setInvitationCode(e.target.value)}
//             />{" "}
//             {/* ✅ New input field */}
//             <button onClick={handleCreateClass}>Create</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeacherDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRDisplay from "../pages/QRDisplay";
import "../styles/TeacherDashboard.css";
import { clientServer } from "../src/config";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [teacherId, setTeacherId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState({
    courseId: "",
    latitude: "",
    longitude: "",
    duration: "",
    radius: "", // ✅ Added radius field
  });
  const [sessionId, setSessionId] = useState("");
  const [showQR, setShowQR] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) return;

        const res = await axios.get(
          `http://localhost:5050/users/user?email=${userEmail}`
        );
        if (res.data.user) {
          localStorage.setItem("id", res.data.user._id);
          setTeacherId(res.data.user._id);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [teacherId]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacherId) return;
      try {
        const res = await clientServer.get(
          `/courses/teacher/${teacherId}/classes`
        );
        setClasses(res.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, [teacherId]);

  // Get User Location
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
        "http://localhost:5050/sessions/create",
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

  const handleCreateClass = async () => {
    if (!courseName.trim() || !courseCode.trim() || !invitationCode.trim()) {
      return alert("All fields are required!");
    }
    if (!teacherId) return alert("Teacher ID not found!");

    try {
      const res = await axios.post(
        "http://localhost:5050/courses/create-class",
        {
          teacherId,
          courseName,
          courseCode,
          invitationCode,
        }
      );

      setClasses((prevClasses) => [...prevClasses, res.data]);
      setCourseName("");
      setCourseCode("");
      setInvitationCode("");
      setShowClassModal(false);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>ScanMe</h2>
        <button onClick={() => setShowClassModal(true)}>+ Create Class</button>
      </aside>
      <main className="dashboard-content">
        <h1>Your Classes</h1>
        <div className="class-grid">
          {classes.map((classItem) => (
            <div key={classItem._id} className="class-card">
              <h3>{classItem.courseName}</h3>
              <p>Code: {classItem.courseCode}</p>
              <button
                onClick={() => {
                  setShowSessionModal(true);
                  setSessionDetails((prev) => ({
                    ...prev,
                    courseId: classItem._id,
                  }));
                  fetchLocation();
                }}
              >
                Create Session
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Modal for Creating a Class */}
      {showClassModal && (
        <div className="modal">
          <div className="modal-content">
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
            <button onClick={handleCreateClass}>Create</button>
            <button onClick={() => setShowClassModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Modal for Creating a Session */}
      {showSessionModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Session</h2>
            <p>Course ID: {sessionDetails.courseId}</p>
            <input
              type="text"
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
              placeholder="Enter Radius (meters)"
              value={sessionDetails.radius}
              onChange={(e) =>
                setSessionDetails((prev) => ({
                  ...prev,
                  radius: e.target.value,
                }))
              }
            />
            <p>Latitude: {sessionDetails.latitude || "Fetching..."}</p>
            <p>Longitude: {sessionDetails.longitude || "Fetching..."}</p>
            <button onClick={handleCreateSession}>Create</button>
            <button onClick={() => setShowSessionModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {showQR && sessionId && (
        <div className="qr-modal">
          <div className="modal-content">
            <h2>Session QR Code</h2>
            <QRDisplay sessionId={sessionId} />
            <button onClick={() => setShowQR(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
