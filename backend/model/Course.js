import mongoose, { model, Schema } from "mongoose";

const courseSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  courseCode: { type: String, required: true, unique: true, index: true },
  courseName: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }], // Enrolled students
  sessions: [{ type: Schema.Types.ObjectId, ref: "Session" }], // ✅ Array of Sessions
}, { timestamps: true });

export const Course = model("Course", courseSchema);
