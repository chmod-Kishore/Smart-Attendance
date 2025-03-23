import { useState } from "react";
import { QrReader } from "react-qr-reader";
import axios from "axios";

export default function QRScanner({ sessionId, studentId }) {
  const [result, setResult] = useState("");

  const handleScan = async (data) => {
    if (data?.text) {
      console.log("Scanned QR Code Data:", data.text); // ✅ Debugging log

      try {
        const position = await getUserLocation();

        // ✅ Send full scannedQRData as received from scanner
        const res = await axios.post(
          "http://localhost:5050/sessions/mark-attendance",
          {
            studentId,
            sessionId,
            latitude: position.latitude,
            longitude: position.longitude,
            scannedQRData: data.text, // ✅ Send full scanned data
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
        constraints={{ facingMode: { ideal: "environment" } }} // ✅ Opens back camera
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
