import mongoose, { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    courseCode: { type: String, required: true},
    courseName: { type: String, required: true},
    invitationCode: { type: String, required: true , unique: true},
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    sessions: [{ type: Schema.Types.ObjectId, ref: "Session" }],
  },
  { timestamps: true }
);

export const Course = model("Course", courseSchema);
