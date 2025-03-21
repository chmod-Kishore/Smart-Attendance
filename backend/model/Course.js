import mongoose, { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    courseCode: { type: String, required: true ,unique:true},
    courseName: { type: String, required: true ,unique:true},
    invitationCode: { type: String, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    sessions: [{ type: Schema.Types.ObjectId, ref: "Session" }],
  },
  { timestamps: true }
);

// ✅ Ensure Course Name & Code are Unique for Each Teacher
//courseSchema.index({ teacherId: 1, courseCode: 1 }, { unique: true });
//courseSchema.index({ teacherId: 1, courseName: 1 }, { unique: true });

export const Course = model("Course", courseSchema);


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

//courseSchema.index({ teacherId: 1, courseCode: 1 }, { unique: true }); // Ensures courseCode is unique per teacher
//courseSchema.index({ teacherId: 1, courseName: 1 }, { unique: true }); // Ensures courseName is unique per teacher

//export const Course = model("Course", courseSchema);
