import mongoose, { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    courseCode: { type: String, required: true, unique: true, index: true },
    courseName: { type: String, required: true, unique: true },
    invitationCode: { type: String, required: true, unique: true }, // ✅ Unique Code for Joining
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }], // ✅ Enrolled students
    sessions: [{ type: Schema.Types.ObjectId, ref: "Session" }], // ✅ Sessions list
  },
  { timestamps: true }
);

// // ✅ Function to Generate Unique Invitation Code
// courseSchema.pre("save", async function (next) {
//   if (!this.invitationCode) {
//     this.invitationCode = generateUniqueCode();
//   }
//   next();
// });

// // ✅ Helper Function to Generate Code
// function generateUniqueCode(length = 8) {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let code = "";
//   for (let i = 0; i < length; i++) {
//     code += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return code;
// }

export const Course = model("Course", courseSchema);
