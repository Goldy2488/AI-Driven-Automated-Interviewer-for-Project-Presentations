import { ocrFromBase64 } from "../utils/ocr.js";
import { extractTopicsFromText } from "../utils/extractTopics.js";

export const analyzeScreen = async (req, res) => {
  try {
    console.log("=== Analyze Screen Request ===");
    const { image } = req.body;
    
    if (!image) {
      console.log("Error: No image in request body");
      return res.status(400).json({ error: "Missing `image` in body" });
    }

    console.log(`Image received, length: ${image.length} chars`);

    // OCR
    console.log("Starting OCR...");
    const ocrText = await ocrFromBase64(image);
    console.log(`OCR completed, text length: ${ocrText.length}`);

    // Summary
    const trimmed = ocrText.trim();
    const summary =
      trimmed.length > 0
        ? trimmed.split("\n").filter(Boolean).slice(0, 6).join(" | ")
        : "No readable text detected on screen";

    // Topics
    console.log("Extracting topics...");
    const topics = extractTopicsFromText(ocrText);
    console.log(`Topics found: ${topics.length}`);

    // Simple heuristics
    const isCodeLike = /function\s+|const\s+|=>|import\s+|class\s+|<\/\w+>/.test(ocrText);

    const result = {
      summary,
      topics,
      text: ocrText,
      code_like: isCodeLike,
      meta: { ocr_length: ocrText.length },
    };

    console.log("Sending response:", { summary, topicsCount: topics.length, textLength: ocrText.length });
    res.json(result);
  } catch (err) {
    console.error("=== analyze-screen ERROR ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      error: "Failed to analyze image", 
      detail: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};



// sdfad