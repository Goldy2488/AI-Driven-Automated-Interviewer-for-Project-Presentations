import React, { useEffect, useRef, useState } from "react";

/**
 Props:
  - onFinish(framesArray, transcript)
  - setStatus(fn)
*/
export default function PresentationRecorder({ onFinish, setStatus }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // seconds
  const [frames, setFrames] = useState([]);
  const [transcript, setTranscript] = useState("");
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    let tick;
    if (isRecording) {
      tick = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            finishRecording();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(tick);
  }, [isRecording]);

  async function startPresentation() {
    try {
      // start screen share
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;

      // capture an immediate frame
      captureFrame(stream);

      // schedule periodic capture every 10s
      intervalRef.current = setInterval(() => {
        captureFrame(screenStreamRef.current);
      }, 10000);

      // start speech recognition (microphone)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("SpeechRecognition not supported. Use Chrome.");
      } else {
        const rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = false;
        rec.onresult = (ev) => {
          const last = ev.results[ev.results.length - 1];
          const text = last[0].transcript;
          setTranscript(prev => (prev + " " + text).trim());
          setStatus && setStatus("Transcript updated");
        };
        rec.onerror = (e) => {
          console.warn("Speech recognition error", e);
          setStatus && setStatus("Speech recognition error");
        };
        rec.start();
        recognitionRef.current = rec;
      }

      setIsRecording(true);
      setStatus && setStatus("Presentation started");
    } catch (err) {
      console.error("startPresentation error:", err);
      alert("Failed to start presentation: " + (err.message || err));
    }
  }

  function captureFrame(stream) {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      imageCapture.grabFrame().then(bitmap => {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        // store base64 dataUrl (we'll slice data later if needed)
        setFrames(prev => {
          // limit stored frames locally to avoid memory growth
          const next = [...prev, dataUrl].slice(-60); // keep last 60 frames max
          return next;
        });
      }).catch(err => {
        console.warn("grabFrame error", err);
      });
    } catch (err) {
      console.warn("captureFrame fallback", err);
    }
  }

  function stopPresentationStreams() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (screenStreamRef.current) {
      try {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      } catch {}
      screenStreamRef.current = null;
    }
  }

  function finishRecording() {
    setIsRecording(false);
    stopPresentationStreams();
    setStatus && setStatus("Presentation finished. Sending for analysis...");
    // send only base64 payload (strip data: prefix server expects either)
    const cleanedFrames = frames.map(f => f.startsWith("data:") ? f.split(",")[1] : f);
    onFinish(cleanedFrames, transcript);
  }

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-semibold mb-3">Presentation (15 minutes)</h2>

      <div className="mb-4 text-center text-2xl font-bold">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2,"0")}
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={startPresentation}
          >
            Start Presentation
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={finishRecording}
          >
            Finish Now
          </button>
        )}

        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => {
            // quick sample: send current frames + transcript to preview show/have server analyze
            const cleaned = frames.map(f => f.startsWith("data:") ? f.split(",")[1] : f);
            onFinish(cleaned, transcript);
          }}
        >
          Send Current Snapshot
        </button>
      </div>

      <div className="mt-4">
        <strong>Transcript preview:</strong>
        <div className="mt-2 p-3 bg-gray-50 rounded min-h-[80px] text-sm">{transcript || <em>No transcript yet</em>}</div>
      </div>

      <div className="mt-3 text-sm text-gray-500">Screenshots captured: {frames.length}</div>
    </div>
  );
}
