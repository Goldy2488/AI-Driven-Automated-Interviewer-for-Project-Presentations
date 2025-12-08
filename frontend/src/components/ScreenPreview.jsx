export default function ScreenPreview({ previewImage }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Captured Screen Preview</h2>

      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Captured"
            className="max-h-64 object-contain"
          />
        ) : (
          <span className="text-gray-500">No screenshot captured</span>
        )}
      </div>
    </div>
  );
}
