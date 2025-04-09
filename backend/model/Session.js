import mongoose, { model, Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    radius: { type: Number, default: 50 },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    duration: { type: Number, required: true }, // Session duration in minutes
    expiresAt: { type: Date, required: true }, // End time of session
    currentQRCode: { type: String }, // Stores the latest QR code
    lastQRUpdatedAt: { type: Date, default: Date.now }, // Track last update time
    attendance: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: "Student" },
        status: { type: String, enum: ["Present", "Absent"], required: true },
        scannedAt: { type: Date },
        scanLocation: { latitude: Number, longitude: Number },
      },
    ],
  },
  { timestamps: true }
);

export const Session = model("Session", sessionSchema);
