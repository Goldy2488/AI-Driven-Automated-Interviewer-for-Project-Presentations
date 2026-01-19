function ScreenPreview({ screenImage }) {
  if (!screenImage) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-2xl">🖥️</span>
        Captured Screen
      </h3>
      <div className="relative overflow-hidden rounded-lg border-2 border-gray-200">
        <img 
          src={screenImage} 
          alt="Screen capture" 
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}

export default ScreenPreview;
