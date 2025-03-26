import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://scanme-wkq3.onrender.com", {
  reconnectionAttempts: 5, // ✅ Retry if disconnected
  reconnectionDelay: 2000, // ✅ Wait 2s before retrying
});

export default function QRDisplay({ sessionId }) {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    socket.emit("joinSession", sessionId);
    console.log(`Joined session: ${sessionId}`);

    socket.on("qrUpdate", (newQRCode) => {
      setQrCode(newQRCode);
      setLoading(false); // ✅ QR Code received, stop loading
    });

    return () => {
      socket.removeAllListeners("qrUpdate"); // ✅ Clean up listeners
    };
  }, [sessionId]);

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      <h3>Live Session QR Code</h3>
      {loading ? (
        <p>Loading QR Code...</p>
      ) : (
        <img
          src={qrCode}
          alt="QR Code"
          style={{
            width: "200px",
            height: "200px",
            border: "2px solid black",
            borderRadius: "10px",
            padding: "5px",
          }}
        />
      )}
    </div>
  );
}
