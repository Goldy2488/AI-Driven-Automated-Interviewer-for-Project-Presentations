export default function Controls({
  onStart,
  onStop,
  onGenerateReport,
  isRunning,
}) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded shadow">
      <button
        onClick={onStart}
        disabled={isRunning}
        className={`px-4 py-2 rounded text-white ${
          isRunning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
        }`}
      >
        Start Interview
      </button>

      <button
        onClick={onStop}
        disabled={!isRunning}
        className={`px-4 py-2 rounded text-white ${
          !isRunning ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
        }`}
      >
        Stop Interview
      </button>

      <button
        onClick={onGenerateReport}
        className="px-4 py-2 rounded bg-green-600 text-white"
      >
        Generate Report
      </button>
    </div>
  );
}
