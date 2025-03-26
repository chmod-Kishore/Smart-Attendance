import { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import axios from "axios";

export default function QRScanner({ sessionId, studentId }) {
  const [result, setResult] = useState("");
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // Default to back camera

  useEffect(() => {
    // Request camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  const handleScan = async (data) => {
    if (data) {
      console.log("Scanned QR Code Data:", data); // ✅ Debugging log

      try {
        const position = await getUserLocation();

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

  if (hasPermission === false) {
    return <p>Camera access denied. Please allow camera permissions.</p>;
  }

  return (
    <div>
      <button
        onClick={() =>
          setFacingMode(facingMode === "environment" ? "user" : "environment")
        }
      >
        Switch Camera
      </button>

      {hasPermission === true ? (
        <QrScanner
          delay={300}
          onScan={handleScan}
          onError={(err) => console.error("QR Scan Error:", err)}
          constraints={{ facingMode }} // ✅ Switch between front and back
          style={{ width: "100%" }}
        />
      ) : (
        <p>Requesting camera access...</p>
      )}

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
