function AIResult({ aiResult }) {
  if (!aiResult) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border-2 border-purple-200">
      <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
        <span className="text-3xl">🤖</span>
        AI Interview Result
      </h2>
      <div className="bg-white rounded-lg p-6 shadow-inner">
        <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
          {aiResult.text}
        </pre>
      </div>
    </div>
  );
}

export default AIResult;
