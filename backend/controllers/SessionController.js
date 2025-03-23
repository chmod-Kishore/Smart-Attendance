// import dotenv from "dotenv";
// dotenv.config();
// import querystring from "querystring";
// import { Teacher } from "../model/Teacher.js";
// import { Student } from "../model/Student.js";
// import uploadImage from "../middleware/Cloudinary.js";

// function getQR(session_id, email) {
//   let url = `${process.env.CLIENT_URL}/login?${querystring.stringify({
//     session_id,
//     email,
//   })}`;
//   return url;
// }

// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // Radius of the Earth in meters
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in meters
//   return distance;
// }
// function checkStudentDistance(Location1, Location2) {
//   Location1 = Location1.split(",");
//   Location2 = Location2.split(",");
//   const locationLat1 = parseFloat(Location1[0]);
//   const locationLon1 = parseFloat(Location1[1]);
//   const locationLat2 = parseFloat(Location2[0]);
//   const locationLon2 = parseFloat(Location2[1]);

//   const distance = haversineDistance(
//     locationLat1,
//     locationLon1,
//     locationLat2,
//     locationLon2
//   );
//   return distance.toFixed(2);
// }

// //make controller functions

// async function CreateNewSession(req, res) {
//   let { session_id, name, duration, location, radius, date, time, token } =
//     req.body;
//   let tokenData = req.user;

//   let newSession = {
//     session_id,
//     date,
//     time,
//     name,
//     duration,
//     location,
//     radius,
//   };

//   try {
//     let teacher = await Teacher.findOneAndUpdate(
//       { email: tokenData.email },
//       { $push: { sessions: newSession } }
//     );

//     res.status(200).json({
//       url: getQR(session_id, teacher.email),
//       message: "Session created successfully",
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }
// //get sessions
// async function GetAllTeacherSessions(req, res) {
//   try {
//     let tokenData = req.user;
//     const teacher = await Teacher.findOne({ email: tokenData.email });
//     res.status(200).json({ sessions: teacher.sessions });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }
// //get QR
// async function GetQR(req, res) {
//   try {
//     let tokenData = req.user;
//     let url = getQR(req.body.session_id, tokenData.email);
//     res.status(200).json({ url });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }

// //attend session
// async function AttendSession(req, res) {
//   let tokenData = req.user;
//   let { session_id, teacher_email, regno, IP, student_email, Location, date } =
//     req.body;
//   let imageName = req.file.filename;

//   try {
//     let present = false;
//     const teacher = await Teacher.findOne({ email: teacher_email });
//     let session_details = {};
//     teacher.sessions.map(async (session) => {
//       if (session.session_id === session_id) {
//         let distance = checkStudentDistance(Location, session.location);
//         session.attendance.map((student) => {
//           if (
//             student.regno === regno ||
//             student.student_email === student_email
//           ) {
//             present = true;
//           }
//         });
//         if (!present) {
//           res.status(200).json({ message: "Attendance marked successfully" });
//           await uploadImage(imageName).then((result) => {
//             session_details = {
//               session_id: session.session_id,
//               teacher_email: teacher.email,
//               name: session.name,
//               date: session.date,
//               time: session.time,
//               duration: session.duration,
//               distance: distance,
//               radius: session.radius,
//               image: result,
//             };
//             session.attendance.push({
//               regno,
//               image: result,
//               date,
//               IP,
//               student_email: tokenData.email,
//               Location,
//               distance,
//             });
//           });
//           await Teacher.findOneAndUpdate(
//             { email: teacher_email },
//             { sessions: teacher.sessions }
//           );
//           await Student.findOneAndUpdate(
//             { email: student_email },
//             { $push: { sessions: session_details } }
//           );
//         }
//       }
//     });
//     if (present) {
//       res.status(200).json({ message: "Attendance already marked" });
//     }
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }

// //get student sessions
// async function GetStudentSessions(req, res) {
//   let tokenData = req.user;
//   try {
//     const student = await Student.findOne({
//       email: tokenData.email,
//     });
//     res.status(200).json({ sessions: student.sessions });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }

// const SessionController = {
//   CreateNewSession,
//   GetAllTeacherSessions,
//   GetQR,
//   AttendSession,
//   GetStudentSessions,
// };

// export default SessionController;

import QRCode from "qrcode";
import { Session } from "../model/Session.js";
import { Course } from "../model/Course.js";
import { Student } from "../model/Student.js";

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
  const activeSessions = await Session.find({ expiresAt: { $gt: Date.now() } });

  let updatedSessions = [];
  for (const session of activeSessions) {
    const qrData = JSON.stringify({
      sessionId: session._id,
      timestamp: Date.now(),
    });
    const newQRCode = await QRCode.toDataURL(qrData);

    session.currentQRCode = newQRCode;
    session.lastQRUpdatedAt = new Date();
    await session.save();

    updatedSessions.push({ sessionId: session._id, newQRCode });
  }
  return updatedSessions;
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

// ✅ Mark Attendance with Radius and Expiry Check
export const markAttendance = async (req, res) => {
  try {
    console.log("Received markAttendance request:", req.body); // ✅ Debugging log

    const { studentId, sessionId, latitude, longitude, scannedQRData } =
      req.body;

    if (!studentId || !sessionId || !latitude || !longitude || !scannedQRData) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found!" });
    }

    let qrData;
    try {
      qrData = JSON.parse(scannedQRData);
      console.log("Parsed QR Data:", qrData); // ✅ Debugging log
    } catch (error) {
      return res.status(400).json({ error: "Invalid QR Code!" });
    }

    if (qrData.sessionId !== session._id.toString()) {
      return res.status(400).json({ error: "Invalid QR Code!" });
    }

    const qrAge = Date.now() - qrData.timestamp;
    if (qrAge > 20000) {
      return res.status(400).json({ error: "Outdated QR Code!" });
    }

    const distance = getDistanceFromLatLonInMeters(
      session.location.latitude,
      session.location.longitude,
      latitude,
      longitude
    );

    if (distance > session.radius) {
      return res.status(400).json({
        error: "You are outside the allowed radius for this session!",
        distance,
        allowedRadius: session.radius,
      });
    }

    // ✅ Find the student's attendance record
    const existingAttendance = session.attendance.find(
      (record) => record.studentId.toString() === studentId
    );

    if (existingAttendance) {
      if (existingAttendance.status === "Present") {
        return res.status(400).json({ error: "Attendance already marked!" });
      }

      // ✅ Update existing record from "Absent" to "Present"
      existingAttendance.status = "Present";
      existingAttendance.scannedAt = new Date();
      existingAttendance.scanLocation = { latitude, longitude };
    } else {
      return res
        .status(400)
        .json({ error: "Student is not part of this session!" });
    }

    await session.save();

    return res.json({ message: "Attendance marked successfully!" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { studentId, sessionId } = req.body;

    if (!studentId || !sessionId) {
      return res
        .status(400)
        .json({ error: "Student ID and Session ID are required!" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found!" });
    }

    // ✅ Check if session is still active
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ error: "Session has expired!" });
    }

    return res.json({ qrCode: session.currentQRCode });
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
