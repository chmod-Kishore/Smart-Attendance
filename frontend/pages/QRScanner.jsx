import { useState } from "react";
import { QrReader } from "react-qr-reader";
import axios from "axios";

export default function QRScanner({ sessionId, studentId }) {
  const [result, setResult] = useState("");

  const handleScan = async (data) => {
    if (data?.text) {
      try {
        const parsedData = JSON.parse(data.text);
        if (!parsedData.sessionId || !parsedData.timestamp) {
          setResult("Invalid QR Code");
          return;
        }

        const position = await getUserLocation();
        const res = await axios.post(
          "http://localhost:5050/sessions/mark-attendance",
          {
            sessionId: parsedData.sessionId,
            latitude: position.latitude,
            longitude: position.longitude,
            timestamp: parsedData.timestamp,
            studentId,
          }
        );

        setResult(res.data.message);
      } catch (error) {
        console.error("Error processing QR Code:", error);
        setResult(error.response?.data?.error || "Failed to mark attendance");
      }
    }
  };

  return (
    <div>
      <QrReader
        delay={300}
        onResult={handleScan}
        constraints={{ facingMode: "environment" }}
        style={{ width: "100%" }}
      />
      <p>{result}</p>
    </div>
  );
}

// ✅ Get User Location with Error Handling
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => {
        console.error("Geolocation Error:", err);
        reject({ latitude: null, longitude: null });
      }
    );
  });
}
