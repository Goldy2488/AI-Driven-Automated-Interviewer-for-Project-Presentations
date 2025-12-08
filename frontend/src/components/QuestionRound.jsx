import React, { useEffect, useRef, useState } from "react";

/**
 props:
  - questions: array of strings
  - onFinish(finalAnswersArray)
  - setStatus(fn)
*/
export default function QuestionRound({ questions = [], onFinish, setStatus }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // reset on questions change
    setIndex(0);
    setAnswers([]);
    setLiveTranscript("");
  }, [questions]);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported. Use Chrome.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const text = ev.results[ev.results.length - 1][0].transcript;
      setLiveTranscript(prev => (prev + " " + text).trim());
      setStatus && setStatus("Recording answer...");
    };
    rec.onerror = (e) => {
      console.warn("rec error", e);
      setStatus && setStatus("Speech recognition error");
    };
    rec.start();
    recognitionRef.current = rec;
  }

  function stopListeningAndNext() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    // push current answer
    setAnswers(prev => {
      const next = [...prev, liveTranscript];
      // if last question -> finish
      if (index >= questions.length - 1) {
        onFinish(next);
      } else {
        setIndex(index + 1);
        setLiveTranscript("");
      }
      return next;
    });
  }

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-semibold mb-3">Answer Questions</h2>

      <div className="mb-4">
        <div className="text-lg font-medium">{index + 1}. {questions[index]}</div>
      </div>

      <div className="p-3 bg-gray-50 rounded min-h-[120px] mb-4">
        <div className="text-sm text-gray-700">{liveTranscript || <em>Press Start Speaking and answer the question aloud...</em>}</div>
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={startListening}>Start Speaking</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={stopListeningAndNext}>Done / Next</button>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Answered: {answers.length} / {questions.length}
      </div>
    </div>
  );
}
