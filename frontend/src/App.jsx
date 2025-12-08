import { useState } from "react";
import ScreenPreview from "./components/ScreenPreview";
import TranscriptBox from "./components/TranscriptBox";
import QuestionList from "./components/QuestionList";
import AnswerList from "./components/AnswerList";
import Controls from "./components/Controls";
import StatusBar from "./components/SttusBar";
import ScreenCapture from "./components/ScreenCapture";
import VideoUpload from "./components/VideoUpload";
import ScreenShareSpeech from "./components/ScreenShareSpeach";

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Idle");
  const [previewImage, setPreviewImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // -----------------------------
  // 1. HANDLE VIDEO UPLOAD
  // -----------------------------
  const handleVideoUpload = (file) => {
    setVideoFile(file);
    setStatus("Video uploaded");
  };

  // -----------------------------
  // 2. CAPTURE SCREENSHOT FROM VIDEO (demo mock)
  // -----------------------------
  const captureScreenshot = async (imageBase64) => {
    setStatus("Capturing and analyzing screen...");

    try {
      // Set the preview image (keep full data URL for display)
      setPreviewImage(imageBase64);

      // Extract base64 string without the data URL prefix for backend
      // Backend expects just the base64 string, not "data:image/png;base64,..."
      const base64Data = imageBase64.split(',')[1] || imageBase64;

      console.log("Sending to API, length:", base64Data.length);

      // Call the analyze-screen API
      const response = await fetch("http://localhost:4000/analyze-screen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Analysis result:", data);
      
      setAnalysisResult(data);
      
      // Optionally update transcript with OCR text
      setTranscript(data.text || "");
      
      setStatus(`Screen analyzed - Found ${data.topics?.length || 0} topics`);
    } catch (error) {
      console.error("Error analyzing screen:", error);
      setStatus(`Error: ${error.message}`);
      alert(`Failed to analyze screen: ${error.message}`);
    }
  };

  // -----------------------------
  // 3. GENERATE QUESTIONS (mock demo)
  // -----------------------------
  const generateQuestions = () => {
    setStatus("Generating questions...");

    // If we have analysis result with topics, use them
    if (analysisResult && analysisResult.topics && analysisResult.topics.length > 0) {
      const topicQuestions = analysisResult.topics.map(
        (topic) => `Can you explain about ${topic}?`
      );
      setQuestions(topicQuestions);
      setStatus(`Generated ${topicQuestions.length} questions from analyzed topics`);
    } else {
      // Fallback to mock questions
      setQuestions([
        "Explain the core feature of your project.",
        "How did you handle state management?",
        "Which technologies did you use and why?",
      ]);
      setStatus("Questions generated");
    }
  };

  // -----------------------------
  // 4. START SPEECH TO TEXT (mock)
  // -----------------------------
  const startListening = () => {
    setStatus("Listening...");

    // Just show fake transcript
    setTranscript("Student: This project is about creating an AI interviewer...");
  };

  // -----------------------------
  // 5. STOP LISTENING (mock)
  // -----------------------------
  const stopListening = () => {
    setStatus("Stopped listening");

    setAnswers((prev) => [
      ...prev,
      {
        question: questions[prev.length],
        answer: transcript,
      },
    ]);

    setTranscript("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">
        AI Interviewer (Frontend)
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        
        <StatusBar status={status} />

        {/* <VideoUpload onVideoSelect={handleVideoUpload} /> */}

        <ScreenShareSpeech onScreenshot={captureScreenshot} />

        {previewImage && <ScreenPreview image={previewImage} />}

        {analysisResult && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Screen Analysis</h2>
            <div className="space-y-2">
              <p><strong>Summary:</strong> {analysisResult.summary}</p>
              {analysisResult.topics && analysisResult.topics.length > 0 && (
                <div>
                  <strong>Detected Topics:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analysisResult.topics.map((topic, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p><strong>Code Detected:</strong> {analysisResult.code_like ? 'Yes' : 'No'}</p>
              <p className="text-sm text-gray-600">
                OCR Length: {analysisResult.meta?.ocr_length || 0} characters
              </p>
            </div>
          </div>
        )}

        <Controls
          onCaptureScreenshot={captureScreenshot}
          onStartListening={startListening}
          onStopListening={stopListening}
          onGenerateQuestions={generateQuestions}
        />

        <TranscriptBox transcript={transcript} />

        <QuestionList questions={questions} />

        <AnswerList answers={answers} />
      </div>
    </div>
  );
}
