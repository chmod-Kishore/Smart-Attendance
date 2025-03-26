import { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import axios from "axios";

export default function QRScanner({ sessionId, studentId }) {
  const [result, setResult] = useState("");
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [videoDeviceId, setVideoDeviceId] = useState(null); // Store camera device ID

  useEffect(() => {
    // Request camera access and get available devices
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setHasPermission(true);
        getBackCamera(); // Set default to back camera
      })
      .catch(() => setHasPermission(false));
  }, []);

  // Get available video devices and set the back camera
  const getBackCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const backCamera = devices.find(
      (device) =>
        device.kind === "videoinput" &&
        device.label.toLowerCase().includes("back")
    );
    setVideoDeviceId(backCamera ? backCamera.deviceId : null);
  };

  // Handle QR Code Scan
  const handleScan = async (data) => {
    if (data) {
      console.log("Scanned QR Code Data:", data);

      try {
        const position = await getUserLocation();

        const res = await axios.post(
          "https://scanme-wkq3.onrender.com/sessions/mark-attendance",
          {
            studentId,
            sessionId,
            latitude: position.latitude,
            longitude: position.longitude,
            scannedQRData: data,
          }
        );

        setResult(res.data.message);
      } catch (error) {
        console.error("Error processing QR Code:", error);
        setResult(error.response?.data?.error || "Failed to mark attendance");
      }
    }
  };

  // Handle Camera Switching
  const switchCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");

    if (cameras.length > 1) {
      // Toggle between front and back camera
      const newDevice =
        facingMode === "environment"
          ? cameras.find((device) =>
              device.label.toLowerCase().includes("front")
            )
          : cameras.find((device) =>
              device.label.toLowerCase().includes("back")
            );

      setVideoDeviceId(newDevice ? newDevice.deviceId : null);
      setFacingMode(facingMode === "environment" ? "user" : "environment");
    }
  };

  if (hasPermission === false) {
    return <p>Camera access denied. Please allow camera permissions.</p>;
  }

  return (
    <div>
      <button onClick={switchCamera}>Switch Camera</button>

      {hasPermission === true ? (
        <QrScanner
          delay={300}
          onScan={handleScan}
          onError={(err) => console.error("QR Scan Error:", err)}
          constraints={{
            video: {
              deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
            },
          }}
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
