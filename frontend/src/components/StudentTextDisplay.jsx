function StudentTextDisplay({ studentText }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-2xl">🗣️</span>
        Student Explanation
      </h3>
      <textarea
        rows="6"
        className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:border-indigo-400 resize-none"
        value={studentText}
        readOnly
        placeholder="Your speech will appear here..."
      />
      <p className="text-sm text-gray-500 mt-2">
        📝 Total words: {studentText.trim().split(/\s+/).filter(Boolean).length}
      </p>
    </div>
  );
}

export default StudentTextDisplay;
