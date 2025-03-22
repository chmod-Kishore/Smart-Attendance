import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5050");

export default function QRDisplay({ sessionId }) {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    socket.emit("joinSession", sessionId);
    socket.on("qrUpdate", (newQRCode) => setQrCode(newQRCode));

    return () => socket.off("qrUpdate");
  }, [sessionId]);

  return (
    <div>
      <img
        src={qrCode}
        alt="QR Code"
        style={{ width: "200px", height: "200px" }}
      />
    </div>
  );
}
