import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/TeacherDashboard.css";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/teacher/classes");
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
      const res = await axios.post("http://localhost:5000/api/teacher/create-class", {
        courseName,
        courseCode,
      });
      setClasses([...classes, res.data]);
      setCourseName("");
      setCourseCode("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>ScanMe</h2>
        <button onClick={() => setShowModal(true)}>+ Create Class</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1>Your Classes</h1>
        <div className="class-grid">
          {classes.length > 0 ? (
            classes.map((classItem) => (
              <div key={classItem._id} className="class-card" onClick={() => navigate(`/teacher/class/${classItem._id}`)}>
                <h3>{classItem.courseName}</h3>
                <p>Code: {classItem.courseCode}</p>
              </div>
            ))
          ) : (
            <p>No classes created yet.</p>
          )}
        </div>
      </main>

      {/* Modal for Class Creation */}
      {showModal && (
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
            <button onClick={handleCreateClass}>Create</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
