import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

export default function QRScanner({ sessionId, studentId }) {
  const [result, setResult] = useState("");
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      facingMode,
    });

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        handleScan(decodedText);
      },
      (errorMessage) => {
        console.error("QR Scan Error:", errorMessage);
      }
    );

    return () => scanner.clear();
  }, [hasPermission, facingMode]);

  const handleScan = async (data) => {
    if (!data) return;

    console.log("Scanned QR Code Data:", data); // ✅ `data` is already a string

    try {
      const position = await getUserLocation();
      const res = await axios.post(
        "https://scanme-wkq3.onrender.com/sessions/mark-attendance",
        {
          studentId,
          sessionId,
          latitude: position.latitude,
          longitude: position.longitude,
          scannedQRData: data, // ✅ Corrected here
        }
      );

      setResult(res.data.message);
    } catch (error) {
      console.error("Error processing QR Code:", error);
      setResult(error.response?.data?.error || "Failed to mark attendance");
    }
  };

  return (
    <div>
      <button
        onClick={() =>
          setFacingMode(facingMode === "environment" ? "user" : "environment")
        }
      >
        Switch Camera
      </button>
      <div id="qr-reader"></div>
      <p>{result}</p>
    </div>
  );
}

// Get user location
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
