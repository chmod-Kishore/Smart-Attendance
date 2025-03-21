import { Course } from "../model/Course.js";
import { Student } from "../model/Student.js";

// 🟢 Create a New Class
export const createClass = async (req, res) => {
  try {
    const { teacherId, courseName, courseCode, invitationCode } = req.body;

    if (!teacherId || !courseName || !courseCode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Create and Save New Course (invitationCode auto-generated)
    const newCourse = new Course({
      teacherId,
      courseName,
      courseCode,
      invitationCode,
    });
    await newCourse.save();

    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: "Error creating class" });
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

    res
      .status(200)
      .json({ message: "Successfully joined the class", course: foundCourse });
  } catch (error) {
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
