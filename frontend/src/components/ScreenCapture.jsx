import { useRef, useState } from "react";

export default function ScreenCapture({ onImageCapture, onStart, onStop }) {
  const screenStreamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      screenStreamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      captureIntervalRef.current = setInterval(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);
        const image = canvas.toDataURL("image/png");

        onImageCapture(image);
      }, 1000);

      setIsCapturing(true);
      onStart?.();

      // Detect when user stops screen sharing
      stream.getTracks()[0].onended = () => {
        stopCapture();
      };
    } catch (error) {
      console.error("Screen capture error:", error);
      alert("Failed to capture screen");
    }
  };

  const stopCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    onStop?.();
  };

  return {
    isCapturing,
    startCapture,
    stopCapture
  };
}
