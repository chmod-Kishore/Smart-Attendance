import { Course } from "../model/Course.js";
import { Student } from "../model/Student.js";
import { Teacher } from "../model/Teacher.js";

// 🟢 Create a New Class
export const createClass = async (req, res) => {
  try {
    const { teacherId, courseName, courseCode, invitationCode } = req.body;

    // ✅ Validate Input
    if (!teacherId || !courseName || !courseCode || !invitationCode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    // ✅ Check for Duplicate Course for the Same Teacher
    const existingCourse = await Course.findOne({
      teacherId,
      $or: [{ courseName }, { courseCode }],
    });

    if (existingCourse) {
      return res.status(400).json({
        error: "Course name or code already exists for this teacher",
      });
    }

    // ✅ Create and Save New Course
    const newCourse = new Course({
      teacherId,
      courseName,
      courseCode,
      invitationCode, // 📌 User-provided invitation code
    });

    await newCourse.save();
    // const teacher=await Teacher.findById({teacherId});
    teacher.courses.push(newCourse._id);
    await teacher.save()

    res.status(201).json({ message: "Class created successfully", newCourse });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// 🟢 Get All Classes for a Teacher
export const getTeacherClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // ✅ Fetch all courses created by the teacher
    const classes = await Course.find({ teacherId });

    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: "Error fetching classes" });
  }
};

// 🟢 Student Joins Class Using Invitation Code
export const joinClass = async (req, res) => {
  try {
    const { studentId, invitationCode } = req.body;

    if (!studentId || !invitationCode) {
      return res
        .status(400)
        .json({ error: "Student ID and Invitation Code required" });
    }

    // ✅ Find Course by Invitation Code
    const foundCourse = await Course.findOne({ invitationCode });

    if (!foundCourse) {
      return res.status(404).json({ error: "Invalid invitation code" });
    }

    // ✅ Check if Student Already Enrolled
    if (foundCourse.students.includes(studentId)) {
      return res.status(400).json({ error: "Already enrolled in this class" });
    }

    // ✅ Add Student to the Course
    foundCourse.students.push(studentId);
    await foundCourse.save();

    // ✅ Add Course to the Student's List
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.courses.push(foundCourse._id);
    await student.save();

    res.status(200).json({
      message: "Successfully joined the class",
      course: foundCourse,
    });
  } catch (error) {
    console.error("Error joining class:", error);
    res.status(500).json({ error: "Error joining class" });
  }
};

// 🟢 Get All Students in a Course
export const getClassStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    // ✅ Find Course and Populate Student List
    const course = await Course.findById(courseId).populate(
      "students",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json(course.students);
  } catch (error) {
    res.status(500).json({ error: "Error fetching students" });
  }
};

export const getStudentClasses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const enrolledClasses = await Course.find({ students: studentId });

    res.status(200).json(enrolledClasses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching enrolled classes" });
  }
};

//import { Course } from "../models/Course.js";

export const getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find course and populate teacher & students
    const course = await Course.findById(id)
      .populate("teacherId", "name email") // Get teacher's name & email
      .populate("students", "name email rollNo dept branch") // Get student details
      //.populate("sessions"); // Get sessions if needed

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


