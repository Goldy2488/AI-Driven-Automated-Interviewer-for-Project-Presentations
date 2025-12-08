export default function TranscriptBox({ transcript }) {
  return (
    <div className="bg-white p-4 rounded shadow h-full">
      <h2 className="font-semibold mb-2">Live Transcript</h2>

      <div className="h-40 overflow-y-auto p-3 bg-gray-100 rounded text-sm leading-relaxed">
        {transcript ? (
          <p>{transcript}</p>
        ) : (
          <p className="text-gray-500">Waiting for speech…</p>
        )}
      </div>
    </div>
  );
}
