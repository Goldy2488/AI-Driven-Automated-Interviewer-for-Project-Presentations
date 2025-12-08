// import express from "express";
// import cors from "cors";
// import analyzeRouter from "./routes/analyze.js";

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: "25mb" }));

// // Routes
// app.use("/analyze-screen", analyzeRouter);

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`AI interviewer backend listening on http://localhost:${PORT}`);
// });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// Allow large screenshot base64
app.use(express.json({ limit: "50mb" }));

// CORS FIX (IMPORTANT)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend running...");
});

// -------------------------------------------------
// 1. ANALYZE SCREEN
// -------------------------------------------------
app.post("/analyze-screen", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).json({ error: "Image missing" });

    // You can add OpenAI Vision here later
    res.json({
      summary: "Screen analysis mock summary",
      topics: ["UI", "Design", "Code"],
      code_like: true,
      meta: { ocr_length: image.length }
    });

  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------
// 2. GENERATE QUESTIONS
// -------------------------------------------------
app.post("/generate-questions", async (req, res) => {
  try {
    const { screenFrames, transcript } = req.body;

    console.log("Received generate-questions request");

    // If OpenAI key missing → give mock
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        summary: "Mock summary (no OpenAI key configured).",
        topics: ["mock-topic-1", "mock-topic-2"],
        questions: [
          "Explain the project's main idea.",
          "What features does the project implement?",
          "How did you manage state?",
          "What libraries did you choose and why?",
          "How are errors handled?",
          "Describe the main data flow.",
          "How is the project tested?",
          "How would you scale this system?",
          "What are the security considerations?",
          "What improvements would you make next?",
        ],
      });
    }

    // REAL OPENAI CALL
    const messages = [
      {
        role: "system",
        content:
          "You are an expert interviewer. Generate 10 technical interview questions based on the student's presentation.",
      },
      {
        role: "user",
        content: `Transcript:\n${transcript}`,
      },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const output = completion.choices[0].message.content;

    res.json({
      summary: "AI-generated summary",
      topics: ["topic1", "topic2"],
      questions: output.split("\n").filter((q) => q.trim().length > 0),
    });

  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------
// 3. START SERVER
// -------------------------------------------------
app.listen(4000, () => {
  console.log("Server running at http://localhost:4000");
});
