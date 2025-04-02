import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/TeacherDashboard.css";
import { clientServer } from "../src/config";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [teacherId, setTeacherId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) return;

        const res = await clientServer.get(`/users/user?email=${userEmail}`);
        if (res.data.user) {
          localStorage.setItem("id", res.data.user._id);
          setTeacherId(res.data.user._id);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacherId) return;
      try {
        setIsLoading(true); // Show loading state
        const res = await clientServer.get(`/courses/teacher/${teacherId}/classes`);
        setClasses(res.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setIsLoading(false); // Hide loading state
      }
    };
    fetchClasses();
  }, [teacherId]);

  const handleCreateClass = async () => {
    if (!teacherId) {
      alert("Error: Teacher ID not found. Please refresh and try again.");
      return;
    }
    
    if (!courseName.trim() || !courseCode.trim() || !invitationCode.trim()) {
      alert("All fields are required!");
      return;
    }

    try {
      const response = await clientServer.post("/courses/create-class", {
        teacherId,
        courseName,
        courseCode,
        invitationCode,
      });

      console.log("Class created successfully:", response.data);

      // Reset form fields
      setCourseName("");
      setCourseCode("");
      setInvitationCode("");
      setShowClassModal(false);

      // Fetch updated class list
      const updatedClasses = await clientServer.get(`/courses/teacher/${teacherId}/classes`);
      setClasses(updatedClasses.data);

    } catch (error) {
      console.error("Error creating class:", error.response ? error.response.data : error);
      alert(`Error: ${error.response?.data?.message || "Something went wrong!"}`);
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
        
        {isLoading ? (
          <p>Loading classes...</p>
        ) : (
          <div className="class-grid">
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <div key={classItem._id} className="class-card">
                  <h3>{classItem.courseName}</h3>
                  <p>Code: {classItem.courseCode}</p>
                  <button onClick={() => navigate(`/course/${classItem._id}`)}>
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p>No classes found.</p>
            )}
          </div>
        )}
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
    </div>
  );
};

export default TeacherDashboard;
