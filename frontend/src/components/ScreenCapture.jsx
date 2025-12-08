import { useRef, useState } from "react";

export default function ScreenCapture({ onStreamReady, onStop }) {
  const videoRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setIsCapturing(true);
      videoRef.current.srcObject = stream;

      // Send stream to parent (App.jsx)
      onStreamReady(stream);
    } catch (err) {
      console.error("Screen capture error:", err);
      alert("Screen capture permission denied.");
    }
  };

  const stopCapture = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    videoRef.current.srcObject = null;
    setIsCapturing(false);

    if (onStop) onStop();
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Screen Capture</h2>

      <video
        ref={videoRef}
        className="w-full h-64 bg-black rounded"
        autoPlay
        playsInline
      ></video>

      <div className="flex gap-2 mt-3">
        {!isCapturing ? (
          <button
            onClick={startCapture}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Start Screen Share
          </button>
        ) : (
          <button
            onClick={stopCapture}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
