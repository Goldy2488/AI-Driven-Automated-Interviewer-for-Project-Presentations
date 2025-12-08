import React from "react";

export default function FinalReport({ questions = [], answers = [], scores = [] }) {
  const total = (scores || []).reduce((s, v) => s + (v || 0), 0);
  const max = (questions.length || scores.length) * 10 || 100;
  const percent = max ? Math.round((total / max) * 100) : 0;

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Final Report</h2>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="border-b pb-3">
            <div className="font-semibold">{i+1}. {q}</div>
            <div className="text-gray-700 mt-1">Answer: {answers[i] || <em>—</em>}</div>
            <div className="text-green-600 font-bold mt-1">Score: {scores[i] ?? "N/A"} / 10</div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="text-lg font-semibold">Total: {total} / {max}</div>
        <div className="text-sm text-gray-600 mt-1">{percent}%</div>
      </div>
    </div>
  );
}
