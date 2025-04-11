import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js";
import SessionRoutes from "./routes/SessionRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import { updateQRCode } from "./controllers/SessionController.js";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB;

const allowedOrigins = [
  "http://localhost:5173",
  "https://qrcheck-htnc.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(MONGODB_URI, {})
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.error("❌ Database Connection Error:", err));

// Routes
app.get("/", (req, res) => res.send("Server is running..."));

app.use("/users", userRoutes);
app.use("/sessions", SessionRoutes);
app.use("/courses", courseRoutes);

// WebSocket for real-time QR updates
io.on("connection", (socket) => {
  console.log("🔗 Client connected:", socket.id);

  socket.on("joinSession", (sessionId) => {
    socket.join(sessionId);
    console.log(`📌 Client joined session: ${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Run QR updates every 40 seconds (outside io.on("connection"))
setInterval(async () => {
  console.log("♻️ Updating QR codes...");
  const updatedSessions = await updateQRCode();
  updatedSessions.forEach(({ sessionId, newQRCode }) => {
    io.to(sessionId.toString()).emit("qrUpdate", newQRCode);
  });
}, 40000);

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
