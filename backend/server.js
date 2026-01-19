const express = require("express");
const cors = require("cors");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"], // Support multiple ports
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, { body: req.body });
  next();
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/interview", async (req, res) => {
  try {
    const { studentText } = req.body;

    if (!studentText) {
      return res.status(400).json({ error: "No student text provided" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
        You are an AI interviewer.

        Student explanation:
        ${studentText}

        Tasks:
        1. Ask ONE technical interview question
        2. Give brief feedback
        3. Give a score out of 10 for clarity and technical depth
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      aiText: text,
    });
  } catch (error) {
    console.error("GEMINI ERROR:", error.message);

    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});



// endpoint to analyze presentation with voice transcript and screen image
app.post("/analyze-presentation", async (req, res) => {
  try {
    const { transcript,screenImage, ocrText } = req.body;  

    if (!transcript && !screenImage && !ocrText) {
      return res.status(400).json({ error: "No data provided for analysis" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Use vision model for REST API too

    let prompt = `
You are an AI assistant analyzing a project presentation.

`;

    // Add transcript analysis if available
    if (transcript) {
      prompt += `
Voice Transcript (What the presenter said):
${transcript}

`;
    }

    // Add OCR text if available
    if (ocrText) {
      prompt += `
Text Extracted from Screen (Code, slides, or documentation visible):
${ocrText}

`;
    }

    // Add image analysis if available
    if (screenImage) {
      prompt += `
A screenshot of the presenter's screen has been captured during the presentation.

`;
    }

    prompt += `
Please analyze the presentation and provide:

**If this is the initial presentation analysis:**
1. **Summary**: What is the project about based on the voice and screen content?
2. **Key Points**: Main features or concepts explained
3. **Technical Details**: Technologies, code, or approaches shown/mentioned
4. **Follow-up Questions**: Generate 3-4 specific technical questions based on what you observed. These questions should:
   - Reference specific parts of the code or UI shown
   - Ask about implementation details
   - Probe technical decisions
   - Be clear and specific

**If this is a follow-up question generation:**
Generate ONE specific follow-up question based on the student's previous answer.

Format your response clearly with sections.
`;

    // If we have an image, use vision model
    if (screenImage) {
      // Remove data URL prefix if present
      const base64Image = screenImage.replace(/^data:image\/\w+;base64,/, "");

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/png",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      res.json({
        analysis: text,
        hasImage: true,
        hasTranscript: !!transcript,
        hasOcrText: !!ocrText,
      });
    } else {
      // Text-only analysis
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        analysis: text,
        hasImage: false,
        hasTranscript: !!transcript,
        hasOcrText: !!ocrText,
      });
    }
  } catch (error) {
    console.error("ANALYSIS ERROR:", error.message);
    res.status(500).json({
      error: "Failed to analyze presentation",
      details: error.message,
    });
  }
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Start interview
  socket.on("start-interview", async (data) => {
    try {
      const { studentName, projectTitle } = data;
      console.log("🎬 Starting interview for:", studentName, projectTitle);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `You are an AI interviewer starting an interview session. 
The student is ${studentName} and they are presenting a project titled "${projectTitle}".

Generate a warm, welcoming introduction message (2-3 sentences) that:
1. Welcomes the student
2. Shows interest in their project
3. Asks them to briefly introduce themselves and explain what problem their project solves

Keep it conversational and encouraging.`;

      socket.emit("ai-state-change", { state: "thinking" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      socket.emit("ai-state-change", { state: "speaking" });
      socket.emit("ai-message", {
        content: text,
        timestamp: new Date().toISOString(),
        stage: "intro"
      });

      setTimeout(() => {
        socket.emit("ai-state-change", { state: "listening" });
      }, 3000);

    } catch (error) {
      console.error("❌ Start interview error:", error);
      socket.emit("error", { message: "Failed to start interview", details: error.message });
    }
  });

  // Handle user response
  socket.on("user-response", async (data) => {
    try {
      const { content, stage, context } = data;
      console.log("💬 User response received:", content.substring(0, 50) + "...");

      socket.emit("ai-state-change", { state: "thinking" });

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      let prompt = "";

      if (stage === "intro") {
        prompt = `You are an AI interviewer. The student just introduced themselves and their project:

"${content}"

Generate a brief acknowledgment (1-2 sentences) that:
1. Appreciates their introduction
2. Smoothly transitions to requesting a screen share demonstration
3. Encourages them to show the project in action

Keep it brief and natural.`;
      } else if (stage === "questions") {
        prompt = `You are an AI interviewer. The student answered your question:

Previous Question: ${context?.previousQuestion || ""}
Student's Answer: "${content}"

Generate a brief follow-up (2-3 sentences) that:
1. Acknowledges their answer
2. Asks ONE specific technical follow-up question based on their response
3. Shows genuine interest in technical details

Be conversational and encouraging.`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      socket.emit("ai-state-change", { state: "speaking" });
      socket.emit("ai-message", {
        content: text,
        timestamp: new Date().toISOString(),
        stage: stage === "intro" ? "presentation-request" : "questions"
      });

      setTimeout(() => {
        socket.emit("ai-state-change", { state: "listening" });
      }, 3000);

    } catch (error) {
      console.error("❌ User response error:", error);
      socket.emit("error", { message: "Failed to process response", details: error.message });
    }
  });

  // Analyze presentation with screen share and voice
  socket.on("analyze-presentation", async (data) => {
    try {
      const { transcript, screenImage, ocrText } = data;
      console.log("🎥 Analyzing presentation...");

      socket.emit("ai-state-change", { state: "thinking" });

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Use vision model for image analysis

      let prompt = `You are an AI interviewer analyzing a project presentation.

`;

      if (transcript) {
        prompt += `Voice Transcript (What the presenter said):
${transcript}

`;
      }

      if (ocrText) {
        prompt += `Text Extracted from Screen (Code, slides, or documentation visible):
${ocrText}

`;
      }

      if (screenImage) {
        prompt += `A screenshot of the presenter's screen has been captured during the presentation.

`;
      }

      prompt += `Please analyze the presentation and provide:

1. **Summary**: What is the project about based on the voice and screen content? (2-3 sentences)
2. **Key Observations**: Main features, technologies, or approaches you noticed (bullet points)
3. **Technical Questions**: Generate 3-4 specific technical questions based on what you observed. These questions should:
   - Reference specific parts of the code or UI shown
   - Ask about implementation details
   - Probe technical decisions
   - Be clear and specific

Format your response clearly with sections and make it conversational.`;

      let result;
      if (screenImage) {
        const base64Image = screenImage.replace(/^data:image\/\w+;base64,/, "");
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/png",
            },
          },
        ]);
      } else {
        result = await model.generateContent(prompt);
      }

      const response = await result.response;
      const text = response.text();

      socket.emit("ai-state-change", { state: "speaking" });
      socket.emit("presentation-analyzed", {
        analysis: text,
        timestamp: new Date().toISOString(),
        hasImage: !!screenImage,
        hasTranscript: !!transcript,
        hasOcrText: !!ocrText,
      });

      setTimeout(() => {
        socket.emit("ai-state-change", { state: "listening" });
      }, 4000);

    } catch (error) {
      console.error("❌ Presentation analysis error:", error);
      socket.emit("error", { message: "Failed to analyze presentation", details: error.message });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
  console.log("🔌 WebSocket server ready");
});
