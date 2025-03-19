import mongoose, { model, Schema } from "mongoose";

const studentSchema = new Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  branch: { type: String, required: true },
  dept: { type: String, required: true },
  password: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Courses student enrolled in
});

export const Student = model("Student", studentSchema);
