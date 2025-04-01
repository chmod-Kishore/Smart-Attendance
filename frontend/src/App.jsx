import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import {
  TeacherDashboard,
  HomeLayout,
  Landing,
  Login,
  Logout,
  Register,
  Nav,
  NewSession,
  StudentDashboard,
  ForgotPassword,
} from "../pages/Index";
import CourseDetails from "../pages/CourseDetails";
import StudentCoursePage from "../pages/StudentCoursePage";
//import { Course } from "../../backend/model/Course";

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="student-dashboard" element={<StudentDashboard />} />
          <Route path="logout" element={<Logout />} />
          <Route path="create-session" element={<NewSession />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="course/:id" element={<CourseDetails/>}/>
          <Route path="student/course/:id" element={<StudentCoursePage/>}/>
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
