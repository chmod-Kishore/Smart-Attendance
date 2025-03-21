import mongoose, { model, Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    attendance: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: "Student" },
        status: { type: String, enum: ["Present", "Absent"], required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Session = model("Session", sessionSchema);
