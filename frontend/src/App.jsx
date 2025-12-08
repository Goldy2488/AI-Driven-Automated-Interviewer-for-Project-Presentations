import React, { useState } from "react";
import PresentationRecorder from "./components/PresentationRecorder";
import QuestionRound from "./components/QuestionRound";
import FinalReport from "./components/FinalReport";
import StatusBar from "./components/StatusBar";

export default function App() {
  const [status, setStatus] = useState("Idle");
  const [presentationResult, setPresentationResult] = useState(null); // { frames, transcript }
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState([]);

  const API_BASE = "http://localhost:4000";

  async function handlePresentationFinish(frames, transcript) {
    setStatus("Sending presentation for analysis...");
    // send only up to N frames to limit payload
    const framesToSend = frames.slice(0, 12);
    try {
      const resp = await fetch(`${API_BASE}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenFrames: framesToSend, transcript }),
      });
      const data = await resp.json();
      setPresentationResult({ frames: framesToSend, transcript });
      setQuestions(data.questions || []);
      setStatus("Questions generated");
    } catch (err) {
      console.error("generate-questions error:", err);
      setStatus("Error generating questions");
      alert("Failed to generate questions: " + err.message);
    }
  }

  async function handleAnswersFinish(finalAnswers) {
    setAnswers(finalAnswers);
    setStatus("Sending answers for scoring...");
    try {
      const resp = await fetch(`${API_BASE}/score-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers: finalAnswers }),
      });
      const data = await resp.json();
      setScores(data.scores || []);
      setStatus("Scoring complete");
    } catch (err) {
      console.error("score-answers error:", err);
      setStatus("Error scoring answers");
      alert("Failed to score answers: " + err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">AI Interviewer — Demo</h1>

      <StatusBar status={status} />

      {!presentationResult && (
        <PresentationRecorder
          onFinish={handlePresentationFinish}
          setStatus={setStatus}
        />
      )}

      {presentationResult && questions.length > 0 && scores.length === 0 && (
        <QuestionRound
          questions={questions}
          onFinish={handleAnswersFinish}
          setStatus={setStatus}
        />
      )}

      {scores.length > 0 && (
        <FinalReport
          questions={questions}
          answers={answers}
          scores={scores}
        />
      )}
    </div>
  );
}
