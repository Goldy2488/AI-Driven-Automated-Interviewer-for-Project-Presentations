import { useState, useRef } from "react";
import ControlPanel from "./components/ControlPanel";
import StudentTextDisplay from "./components/StudentTextDisplay";
import ScreenPreview from "./components/ScreenPreview";
import SubmitButton from "./components/SubmitButton";
import AIResult from "./components/AIResult";

function App() {
  const [studentText, setStudentText] = useState("");
  const [screenImage, setScreenImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const recognitionRef = useRef(null);
  const screenStreamRef = useRef(null);
  const captureIntervalRef = useRef(null);

  // 🎤 START VOICE RECOGNITION
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;
      setStudentText((prev) => prev + " " + transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  // 🛑 STOP VOICE
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // 🖥️ SCREEN CAPTURE
  const captureScreen = async () => {
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

        setScreenImage(image);
      }, 1000);

      setIsCapturing(true);
      
      // 🎤 Automatically start voice recognition
      startListening();

      // 🛑 Detect when user stops screen sharing
      stream.getTracks()[0].onended = () => {
        stopScreenCapture();
      };

    } catch (error) {
      console.error("Screen capture error:", error);
      alert("Failed to capture screen");
    }
  };

  const stopScreenCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    
    // 🛑 Automatically stop voice recognition
    stopListening();
  };


  // 🚀 SEND TO BACKEND
  const submitInterview = async () => {
    try {
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentText
        })
      });

      const data = await res.json();
      
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }
      
      // Parse the AI response text to extract structured data
      setAiResult({ text: data.aiText });
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit interview");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🎓 AI Project Interviewer</h1>

      <div style={{ marginBottom: 10 }}>
        {!isCapturing ? (
          <button onClick={captureScreen} style={{ padding: "10px 20px", fontSize: "16px" }}>
            🖥️ Start Screen Share & Speaking
          </button>
        ) : (
          <button onClick={stopScreenCapture} style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#ff4444", color: "white" }}>
            🛑 Stop Screen Share & Speaking
          </button>
        )}
        {listening && <span style={{ marginLeft: 10, color: "red" }}>� Recording...</span>}
      </div>

      <h3>🗣️ Student Explanation</h3>
      <textarea
        rows="6"
        style={{ width: "100%" }}
        value={studentText}
        readOnly
      />

      {screenImage && (
        <>
          <h3>🖥️ Captured Screen</h3>
          <img src={screenImage} width="100%" />
        </>
      )}

      <br />
      <button onClick={submitInterview}>🚀 Submit to AI</button>

      {aiResult && (
        <div style={{ marginTop: 20, padding: 15, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
          <h2>🤖 AI Interview Result</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Arial" }}>
            {aiResult.text}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
