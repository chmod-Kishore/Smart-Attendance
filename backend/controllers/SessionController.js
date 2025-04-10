import QRCode from "qrcode";
import { Session } from "../model/Session.js";
import { Course } from "../model/Course.js";
import { Student } from "../model/Student.js";
import mongoose from "mongoose";

export const createSession = async (req, res) => {
  try {
    const { courseId, latitude, longitude, duration, radius } = req.body;

    if (!courseId || !latitude || !longitude || !duration || !radius) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const course = await Course.findById(courseId).populate("students");
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    // Generate session data for QR Code
    const sessionData = `${courseId}-${Date.now()}`;
    const qrCodeUrl = await QRCode.toDataURL(sessionData);

    // Calculate session expiration time
    const expiresAt = new Date(Date.now() + duration * 60000);

    // ✅ Prepopulate attendance with all students as "Absent"
    const initialAttendance = course.students.map((student) => ({
      studentId: student._id,
      status: "Absent",
      scannedAt: null,
      scanLocation: null,
    }));

    // Create session entry in DB
    const session = new Session({
      courseId,
      location: { latitude, longitude },
      duration,
      expiresAt,
      radius,
      currentQRCode: qrCodeUrl,
      lastQRUpdatedAt: Date.now(),
      attendance: initialAttendance, // ✅ Adding all students with "Absent"
    });

    await session.save();

    // ✅ Add session ID to the respective class
    course.sessions.push(session._id);
    await course.save();

    return res.json({
      message: "Session created successfully!",
      sessionId: session._id,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Generate and update QR codes every 10 sec
export async function updateQRCode() {
  try {
    const activeSessions = await Session.find({
      expiresAt: { $gt: Date.now() },
    });

    let updatedSessions = [];
    for (const session of activeSessions) {
      const qrData = JSON.stringify({
        sessionId: session._id.toString(), // Ensuring string format
        timestamp: Date.now(),
      });

      const newQRCode = await QRCode.toDataURL(qrData);
      if (session.currentQRCode !== newQRCode) {
        session.currentQRCode = newQRCode;
        session.lastQRUpdatedAt = new Date();
        await session.save();
      }

      updatedSessions.push({ sessionId: session._id, newQRCode });
    }
    return updatedSessions;
  } catch (error) {
    console.error("Error updating QR codes:", error);
    return [];
  }
}

// ✅ Calculate Distance between two coordinates
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

export const markAttendance = async (req, res) => {
  try {
    console.log("Received markAttendance request:", req.body);

    const { studentId, sessionId, latitude, longitude, scannedQRData } =
      req.body;

    if (!studentId || !sessionId || !latitude || !longitude || !scannedQRData) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found!" });
    }

    console.log("Session Location:", session.location);
    console.log("User Location:", { latitude, longitude });
    console.log("Allowed Radius:", session.radius);

    let qrData;
    try {
      qrData = JSON.parse(scannedQRData);
      console.log("Parsed QR Data:", qrData);
    } catch (error) {
      return res.status(400).json({ error: "Invalid QR Code!" });
    }

    if (qrData.sessionId !== session._id.toString()) {
      return res.status(400).json({ error: "QR Code does not match session!" });
    }

    if (Date.now() - qrData.timestamp > 40000) {
      return res.status(400).json({ error: "QR Code expired!" });
    }

    const distance = getDistanceFromLatLonInMeters(
      session.location.latitude,
      session.location.longitude,
      latitude,
      longitude
    );

    console.log("Calculated Distance:", distance);

    if (distance > session.radius) {
      return res
        .status(400)
        .json({ error: "You are outside the allowed radius!" });
    }

    let studentAttendance = session.attendance.find(
      (record) => record.studentId.toString() === studentId
    );

    if (studentAttendance) {
      if (studentAttendance.status === "Present") {
        return res.status(400).json({ error: "Attendance already marked!" });
      }
      studentAttendance.status = "Present";
      studentAttendance.scannedAt = new Date();
      studentAttendance.scanLocation = { latitude, longitude };
    } else {
      session.attendance.push({
        studentId,
        status: "Present",
        scannedAt: new Date(),
        scanLocation: { latitude, longitude },
      });
    }

    await session.save();
    return res.json({ message: "Attendance marked successfully!" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const updateAttendanceStatus = async (req, res) => {
//   try {
//     console.log("Request Body:", req.body);
//     const { sessionId, studentId, status } = req.body;

//     if (!sessionId || !studentId || !status) {
//       return res.status(400).json({ error: "All fields are required!" });
//     }

//     if (!["Present", "Absent"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status value!" });
//     }

//     const session = await Session.findById(sessionId);
//     if (!session) {
//       return res.status(404).json({ error: "Session not found!" });
//     }
//     const objectStudentId = new mongoose.Types.ObjectId(studentId);
//     console.log(
//       "Session Attendance:",
//       session.attendance.map((r) => r.studentId.toString())
//     );

//     const attendanceRecord = session.attendance.find((record) =>
//       record.studentId.equals(objectStudentId)
//     );

//     if (!attendanceRecord) {
//       return res
//         .status(404)
//         .json({ error: "Student not found in attendance!" });
//     }

//     console.log("Before Update:", attendanceRecord);

//     attendanceRecord.status = status;
//     attendanceRecord.scannedAt = status === "Present" ? new Date() : undefined;
//     attendanceRecord.scanLocation =
//       status === "Present" ? session.location : undefined;

//     // Either keep this if needed or comment to test
//     session.markModified("attendance");

//     await session.save();

//     const updated = await Session.findById(sessionId);
//     console.log(
//       "After Save:",
//       updated.attendance.find((r) => r.studentId.equals(studentId))
//     );

//     return res.json({ message: "Attendance status updated successfully!" });
//   } catch (error) {
//     console.error("Error updating attendance status:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const updateAttendanceStatus = async (req, res) => {
//   try {
//     console.log("Request Body:", req.body);
//     const { sessionId, studentId, status } = req.body;

//     if (!sessionId || !studentId || !status) {
//       return res.status(400).json({ error: "All fields are required!" });
//     }

//     if (!["Present", "Absent"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status value!" });
//     }

//     const session = await Session.findById(sessionId);
//     if (!session) {
//       return res.status(404).json({ error: "Session not found!" });
//     }

//     console.log(
//       "Session Attendance Before Update:",
//       session.attendance.map((r) => ({
//         studentId: r.studentId.toString(),
//         status: r.status,
//       }))
//     );

//     // Remove the existing attendance record for the student
//     session.attendance = session.attendance.filter(
//       (record) => record.studentId.toString() !== studentId
//     );

//     // Add the updated attendance record
//     session.attendance.push({
//       studentId: new mongoose.Types.ObjectId(studentId),
//       status,
//       scannedAt: status === "Present" ? new Date() : undefined,
//       scanLocation: status === "Present" ? session.location : undefined,
//     });

//     // Mark the attendance array as modified
//     session.markModified("attendance");

//     // Save the updated session
//     await session.save();

//     console.log(
//       "Session Attendance After Update:",
//       session.attendance.map((r) => ({
//         studentId: r.studentId.toString(),
//         status: r.status,
//       }))
//     );

//     return res.json({ message: "Attendance status updated successfully!" });
//   } catch (error) {
//     console.error("Error updating attendance status:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const updateAttendanceStatus = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { sessionId, studentId, status } = req.body;

    if (!sessionId || !studentId || !status) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value!" });
    }

    // Get the session document to extract location for 'Present'
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found!" });
    }

    // Extract location (needed if status is Present)
    const location = session.location;

    // Update attendance using MongoDB positional operator `$`
    const updateResult = await Session.updateOne(
      { _id: sessionId, "attendance.studentId": studentId },
      {
        $set: {
          "attendance.$.status": status,
          "attendance.$.scannedAt": status === "Present" ? new Date() : null,
          "attendance.$.scanLocation":
            status === "Present"
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                }
              : null,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({
        error: "Attendance record not found for the student in this session!",
      });
    }

    return res.json({ message: "Attendance status updated successfully!" });
  } catch (error) {
    console.error("Error updating attendance status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
