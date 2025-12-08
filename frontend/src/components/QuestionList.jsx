export default function QuestionList({ questions }) {
  return (
    <div className="bg-white p-4 rounded shadow h-full">
      <h2 className="font-semibold mb-2">Interview Questions</h2>

      <div className="h-40 overflow-y-auto space-y-2">
        {questions.length > 0 ? (
          questions.map((q) => (
            <div
              key={q.id}
              className="p-3 bg-blue-50 border border-blue-200 rounded text-sm"
            >
              {q.text}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            Waiting for system to generate questions…
          </p>
        )}
      </div>
    </div>
  );
}
