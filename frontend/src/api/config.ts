export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  ENDPOINTS: {
    INTERVIEW: "/interview",
    ANALYZE_PRESENTATION: "/analyze-presentation"
  },
  TIMEOUT: 30000, // 30 seconds
};

export const API_ERRORS = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Invalid data. Please check your input.",
};
