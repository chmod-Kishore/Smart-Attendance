// import { useEffect, useState, useRef } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import axios from "axios";
// import "../styles/QRScanner.css";
// export default function QRScanner({ sessionId, studentId, onSuccess }) {
//   const [result, setResult] = useState("");
//   const [hasPermission, setHasPermission] = useState(null);
//   const [facingMode, setFacingMode] = useState("environment");
//   const [isScanning, setIsScanning] = useState(false);
//   const html5QrCodeRef = useRef(null);

//   useEffect(() => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true })
//       .then(() => setHasPermission(true))
//       .catch(() => setHasPermission(false));
//   }, []);

//   useEffect(() => {
//     if (!hasPermission || !isScanning) return;

//     const html5QrCode = new Html5Qrcode("qr-reader");
//     html5QrCodeRef.current = html5QrCode;

//     html5QrCode
//       .start(
//         { facingMode },
//         {
//           fps: 10,
//           qrbox: { width: 250, height: 250 },
//         },
//         async (decodedText) => {
//           await html5QrCode.stop();
//           setIsScanning(false);
//           handleScan(decodedText);
//         },
//         (errorMessage) => {
//           console.warn("QR Error:", errorMessage);
//         }
//       )
//       .catch((err) => {
//         console.error("Start Scan Error:", err);
//         setResult("Failed to start scanner");
//       });

//     return () => {
//       html5QrCode
//         .stop()
//         .then(() => html5QrCode.clear())
//         .catch((e) => console.error("Stop Error:", e));
//     };
//   }, [hasPermission, isScanning, facingMode]);

//   const handleScan = async (data) => {
//     console.log("Scanned QR Code:", data);
//     try {
//       const position = await getUserLocation();
//       const res = await axios.post(
//         "https://scanme-wkq3.onrender.com/sessions/mark-attendance",
//         {
//           studentId,
//           sessionId,
//           latitude: position.latitude,
//           longitude: position.longitude,
//           scannedQRData: data,
//         }
//       );
//       setResult(res.data.message);
//       if (onSuccess) onSuccess();
//     } catch (error) {
//       console.error("Error marking attendance:", error);
//       setResult(error.response?.data?.error || "Failed to mark attendance");
//     }
//   };

//   return (
//     <div className="scanner-container">
//       <h2>Scan QR Code</h2>

//       <div className="scanner-box">
//         <div id="qr-reader" />
//       </div>

//       <div className="controls">
//         <button
//           className="switch-camera"
//           onClick={() =>
//             setFacingMode(facingMode === "environment" ? "user" : "environment")
//           }
//         >
//           Switch Camera
//         </button>

//         {isScanning ? (
//           <button
//             className="stop-scan"
//             onClick={() => {
//               html5QrCodeRef.current?.stop().then(() => {
//                 html5QrCodeRef.current.clear();
//                 setIsScanning(false);
//               });
//             }}
//           >
//             Stop Scanning
//           </button>
//         ) : (
//           <button className="start-scan" onClick={() => setIsScanning(true)}>
//             Start Scanning
//           </button>
//         )}
//       </div>

//       <p>{result}</p>
//     </div>
//   );
// }

// async function getUserLocation() {
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) =>
//         resolve({
//           latitude: pos.coords.latitude,
//           longitude: pos.coords.longitude,
//         }),
//       (err) => {
//         console.error("Geolocation Error:", err);
//         reject({ latitude: null, longitude: null });
//       }
//     );
//   });
// }
import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import "../styles/QRScanner.css";

export default function QRScanner({ sessionId, studentId, onSuccess }) {
  const [result, setResult] = useState("");
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const html5QrCodeRef = useRef(null);

  // Ask for camera permission
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then(() => setHasPermission(true))
      .catch((err) => {
        console.error("Camera permission error:", err);
        setHasPermission(false);
        setResult("Camera access denied");
      });
  }, [facingMode]);

  // Start QR scanner and location access BEFORE scan
  useEffect(() => {
    if (!hasPermission) return;

    let html5QrCode;
    let location = null;

    const startScanner = async () => {
      try {
        location = await getUserLocation(); // request location BEFORE scan

        html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            await html5QrCode.stop();
            html5QrCode.clear();
            handleScan(decodedText, location);
          },
          (errorMessage) => {
            console.warn("QR Scan Error:", errorMessage);
          }
        );
      } catch (err) {
        console.error("Start Scan Error:", err);
        setResult("Failed to start scanner or access location");
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch((e) => console.error("Stop Error:", e));
      }
    };
  }, [hasPermission, facingMode]);

  const handleScan = async (data, position) => {
    console.log("Scanned QR Code:", data);
    try {
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
      if (onSuccess) onSuccess(); // closes modal, should not navigate
    } catch (error) {
      console.error("Error marking attendance:", error);
      setResult(error.response?.data?.error || "Failed to mark attendance");
    }
  };

  return (
    <div className="scanner-container">
      <h2>Scan QR Code</h2>

      <div className="scanner-box">
        <div id="qr-reader" />
      </div>

      <div className="controls">
        <button
          className="switch-camera"
          onClick={() =>
            setFacingMode(facingMode === "environment" ? "user" : "environment")
          }
        >
          Switch Camera
        </button>
      </div>

      <p>{result}</p>
    </div>
  );
}

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
