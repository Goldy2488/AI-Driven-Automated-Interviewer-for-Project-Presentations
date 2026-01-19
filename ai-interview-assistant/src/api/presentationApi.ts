const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface AnalyzePresentationRequest {
  transcript?: string;
  screenImage?: string | null;
  ocrText?: string;
}

export interface AnalyzePresentationResponse {
  analysis: string;
  hasImage: boolean;
  hasTranscript: boolean;
  hasOcrText: boolean;
  error?: string;
}

export const analyzePresentation = async (
  data: AnalyzePresentationRequest
): Promise<AnalyzePresentationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-presentation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error("Analyze presentation API error:", error);
    throw error;
  }
};

export const submitInterview = async (studentText: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentText }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Submit interview API error:", error);
    throw error;
  }
};
