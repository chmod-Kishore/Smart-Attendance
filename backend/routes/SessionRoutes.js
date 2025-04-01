import express from "express";
import {
  createSession,
  joinSession,
  markAttendance,
} from "../controllers/SessionController.js";

const router = express.Router();

router.post("/create", createSession);
router.post("/mark-attendance", markAttendance);
export default router;
