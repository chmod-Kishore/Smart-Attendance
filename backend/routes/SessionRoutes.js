import express from "express";
import {
  createSession,
  markAttendance,
  updateAttendanceStatus,
} from "../controllers/SessionController.js";

const router = express.Router();

router.post("/create", createSession);
router.post("/mark-attendance", markAttendance);
router.post("/update-attendance-status", updateAttendanceStatus);

export default router;
