export default function AnswerList({ answers, questions }) {
  const getQuestionText = (id) => {
    const q = questions.find((item) => item.id === id);
    return q ? q.text : "Unknown question";
  };

  return (
    <div className="bg-white p-4 rounded shadow h-full">
      <h2 className="font-semibold mb-2">Student Answers</h2>

      <div className="h-40 overflow-y-auto space-y-3">
        {answers.length > 0 ? (
          answers.map((ans, index) => (
            <div
              key={index}
              className="p-3 bg-green-50 border border-green-200 rounded"
            >
              <p className="text-sm font-medium text-green-900">
                {getQuestionText(ans.questionId)}
              </p>
              <p className="text-sm mt-1 text-gray-700">{ans.answer}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            Waiting for student answers…
          </p>
        )}
      </div>
    </div>
  );
}
