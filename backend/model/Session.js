import mongoose, { model, Schema } from "mongoose";

const sessionSchema = new Schema({
  courseId: { type: schema.Types.ObjectId, ref: "Course", required: true },
  date: { type: Date, default: Date.now },
  attendance: [
    {
      studentId: { type: schema.Types.ObjectId, ref: "Student" },
      status: { type: String, enum: ["Present", "Absent"], required: true },
    },
  ],
});

export const Session = model("Session", sessionSchema);
