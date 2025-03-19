import mongoose, { model, Schema } from "mongoose";

const courseSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  courseId: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }], // Enrolled students
});

export const Course = model("Course", courseSchema);
