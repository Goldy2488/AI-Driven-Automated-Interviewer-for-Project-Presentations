function SubmitButton({ onClick, isSubmitting, disabled }) {
  return (
    <div className="flex justify-center mb-6">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${disabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
          }
          text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-200 flex items-center gap-3 text-lg
        `}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <span className="text-2xl">🚀</span>
            Submit to AI
          </>
        )}
      </button>
    </div>
  );
}

export default SubmitButton;
