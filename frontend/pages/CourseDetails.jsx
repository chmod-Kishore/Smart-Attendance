import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { clientServer } from "../src/config";
import "../styles/CourseDetails.css"; // Import styles

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await clientServer.get(`/courses/${id}`);
        console.log("Course Data:", res.data); // Debugging
        setCourse(res.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourseDetails();
  }, [id]);
  

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
        <button className="create-session-btn">Create Session</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1>{course.courseName}</h1>
        <div className="course-info">
          <p><strong>Instructor:</strong> {course.teacherId.name}</p>
        </div>

        {/* Enrolled Students Table */}
        <h2>Enrolled Students</h2>
        {course.students.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Department</th>
                <th>Branch</th>
              </tr>
            </thead>
            <tbody>
              {course.students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td>{student.dept}</td>
                  <td>{student.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No students enrolled yet.</p>
        )}
      </main>
    </div>
    
     
    
  );
};

export default CourseDetails;
