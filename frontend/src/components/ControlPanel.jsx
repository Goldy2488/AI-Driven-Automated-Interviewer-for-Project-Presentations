function ControlPanel({ isCapturing, listening, onStartCapture, onStopCapture }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-center gap-4">
        {!isCapturing ? (
          <button
            onClick={onStartCapture}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
          >
            <span className="text-xl">🖥️</span>
            Start Screen Share & Speaking
          </button>
        ) : (
          <button
            onClick={onStopCapture}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
          >
            <span className="text-xl">🛑</span>
            Stop Screen Share & Speaking
          </button>
        )}
        
        {listening && (
          <div className="flex items-center gap-2 text-red-600 font-semibold animate-pulse">
            <span className="text-2xl">🔴</span>
            <span>Recording...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;
