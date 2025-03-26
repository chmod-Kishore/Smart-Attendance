import { useState } from "react";
import QrScanner from "react-qr-scanner";

import axios from "axios";

export default function QRScanner({ sessionId, studentId }) {
  const [result, setResult] = useState("");

  const handleScan = async (data) => {
    if (data) {
      console.log("Scanned QR Code Data:", data); // ✅ Debugging log

      try {
        const position = await getUserLocation();

        // ✅ Send full scannedQRData as received from scanner
        const res = await axios.post(
          "https://scanme-wkq3.onrender.com/sessions/mark-attendance",
          {
            studentId,
            sessionId,
            latitude: position.latitude,
            longitude: position.longitude,
            scannedQRData: data, // ✅ Send full scanned data
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
      <QrScanner
        delay={300}
        onScan={handleScan} // ✅ Correct function name
        onError={(err) => console.error("QR Scan Error:", err)}
        constraints={{ facingMode: "environment" }} // ✅ Opens back camera
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
