import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/TeacherDashboard.css";
import { Teacher } from "../../backend/model/Teacher";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const navigate = useNavigate();
  const email=localStorage.getItem("email");
  // ✅ Fetch teacherId from localStorage
  // const teacherId = localStorage.getItem("_id"); // 🟢 Ensure it matches stored key

  async function getId(){
    const details=await Teacher.findOne({email});
    return details._id;
  }
  
  useEffect(() => {
    const fetchClasses = async () => {
      const teacherId=getId();
      try {
        const res = await axios.get(`http://localhost:5050/courses/teacher/${teacherId}/classes`);
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
    const teacherId=getId()
    try {
      const res = await axios.post("http://localhost:5050/courses/create-class", {
        teacherId, // ✅ Now correctly fetching from localStorage
        courseName,
        courseCode,
      });
      setClasses((prevClasses) => [...prevClasses, res.data]); // ✅ Update UI
      setCourseName("");
      setCourseCode("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem("email"); // ✅ Fetch email from localStorage
        const res = await axios.get(`http://localhost:5050/user/${userEmail}`);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user)); // ✅ Store user details
          setTeacherId(res.data.user._id); // ✅ Store teacher ID
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
  
    fetchUserDetails();
  }, []);
  function getId() {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? user._id : null;
  }
  
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
