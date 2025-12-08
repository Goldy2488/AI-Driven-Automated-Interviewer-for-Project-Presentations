export default function StatusBar({ status }) {
  return (
    <div className="bg-yellow-50 border border-yellow-300 p-3 rounded text-sm text-yellow-800">
      <strong>Status:</strong> {status || "Idle"}
    </div>
  );
}
