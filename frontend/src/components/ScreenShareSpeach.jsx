import { useState, useRef, useEffect } from "react";

export default function ScreenShareSpeech({ onScreenshot }) {
  const videoRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  // ---------------------------
  // 1. START SCREEN SHARE
  // ---------------------------
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: "always",
          displaySurface: "monitor"
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video loaded:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
        };
      }

      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        console.log("Screen sharing stopped by user");
        stopScreenShare();
      };

      setIsSharing(true);
      console.log("Screen sharing started successfully");
    } catch (err) {
      console.error("Screen share error:", err);
      alert(`Failed to start screen share: ${err.message}`);
    }
  };

  // ---------------------------
  // 2. STOP SCREEN SHARE
  // ---------------------------
  const stopScreenShare = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsSharing(false);
    console.log("Screen sharing stopped");
  };

  // ---------------------------
  // 3. CAPTURE CURRENT SCREENSHOT
  // ---------------------------
  const captureScreenshot = () => {
    if (!videoRef.current) {
      alert("Video element not found");
      return;
    }

    const video = videoRef.current;
    
    // Check if video has proper dimensions
    if (!video.videoWidth || !video.videoHeight) {
      alert("Video stream not ready. Please wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get base64 image (remove the "data:image/png;base64," prefix for backend)
    const base64Image = canvas.toDataURL("image/png");

    console.log("Screenshot captured:", base64Image.substring(0, 50) + "...");

    if (onScreenshot) {
      onScreenshot(base64Image);
    } else {
      console.error("onScreenshot callback not provided");
    }
  };

  // ---------------------------
  // 4. START SPEECH RECOGNITION
  // ---------------------------
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      setTranscript(text);
    };

    recognition.onerror = (err) => {
      console.error("Speech error:", err);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // ---------------------------
  // 5. STOP SPEECH RECOGNITION
  // ---------------------------
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // ---------------------------
  // CLEANUP ON UNMOUNT
  // ---------------------------
  useEffect(() => {
    return () => {
      // Stop screen share on unmount
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      
      // Stop speech recognition on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow w-full space-y-4">
      <h2 className="text-xl font-semibold">Screen Share + Speech</h2>

      {/* Screen Share Buttons */}
      <div className="flex gap-3">
        {!isSharing ? (
          <button
            onClick={startScreenShare}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Start Screen Share
          </button>
        ) : (
          <button
            onClick={stopScreenShare}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Stop Screen Share
          </button>
        )}

        {isSharing && (
          <button
            onClick={captureScreenshot}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Capture Screenshot
          </button>
        )}
      </div>

      {/* Live Screen Preview */}
      {isSharing && (
        <video
          ref={videoRef}
          autoPlay
          className="w-full rounded border"
        />
      )}

      {/* Speech Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={startSpeechRecognition}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Start Speech
        </button>
        <button
          onClick={stopSpeechRecognition}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Stop Speech
        </button>
      </div>

      {/* Live Transcript */}
      <div className="bg-gray-100 p-3 rounded border">
        <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
      </div>
    </div>
  );
}
