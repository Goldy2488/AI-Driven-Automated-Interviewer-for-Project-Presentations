const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const OpenAI = require("openai");
require("dotenv").config();

// Initialize OpenAI (more stable than Gemini with API key issues)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to generate AI responses
// Using mock responses since both Gemini and OpenAI have API key issues
async function generateAIResponse(prompt) {
  try {
    // FORCE MOCK MODE - Set to false when API keys are working
    const FORCE_MOCK_MODE = true;
    const useMock = FORCE_MOCK_MODE || !process.env.OPENAI_API_KEY || process.env.USE_MOCK_AI === 'true';
    
    if (useMock) {
      // Mock AI responses for testing
      console.log("🤖 Using MOCK AI responses (API quota exceeded)");
      
      // Check for interview start prompt
      if (prompt.toLowerCase().includes("start the interview") || prompt.includes("friendly AI interviewer")) {
        const projectMatch = prompt.match(/Project: ([^\n]+)/);
        const projectName = projectMatch ? projectMatch[1] : 'your project';
        const nameMatch = prompt.match(/Name: ([^\n]+)/);
        const studentName = nameMatch ? nameMatch[1] : 'there';
        
        return `Hello ${studentName}! Welcome to your project interview. I'm excited to learn about ${projectName}! 

To get started, could you please:
1. Briefly introduce yourself and your background
2. Explain what problem your project solves
3. Share what motivated you to build this

Take your time!`;
      }
      
      // Check for presentation analysis prompt
      if (prompt.toLowerCase().includes("analyzing a student's project presentation") || prompt.includes("presentation data") || prompt.includes("generate EXACTLY 5 technical interview questions")) {
        return `Thank you for your presentation! I've reviewed your work and I'm impressed. Now I'd like to ask you 5 technical questions:

Q1: Can you explain the main architecture decisions you made for this system and why you chose this approach?

Q2: What were the biggest technical challenges you faced during development, and how did you overcome them?

Q3: How did you handle data persistence and state management in your application?

Q4: What security measures have you implemented to protect user data and prevent vulnerabilities?

Q5: If you had more time, what features would you add next, and what improvements would you make to the existing codebase?

Please answer these questions one by one. Take your time to explain your thought process!`;
      }
      
      // Check for user response follow-up
      if (prompt.toLowerCase().includes("student just said") || prompt.includes("user_response")) {
        return "That's interesting! Thank you for sharing that perspective. Can you elaborate more on the technical implementation details? What specific technologies or frameworks did you use, and why did you choose them?";
      }
      
      // Generic fallback
      return "Thank you for sharing. That's a good point. Can you tell me more about the technical aspects and implementation details of your approach?";
    }
    
    // Real OpenAI API call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error.message);
    // Fallback to mock if API fails
    console.log("⚠️  API failed, using mock fallback response");
    return "I understand. Could you tell me more about the technical aspects of your project?";
  }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
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

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body ? { body: req.body } : '');
  next();
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Original interview endpoint
app.post("/interview", async (req, res) => {
  console.log("Received body:", req.body);
  
  try {
    const { studentText } = req.body;
    
    if (!studentText) {
      return res.status(400).json({
        error: "Bad Request",
        details: "studentText is required"
      });
    }

    const prompt = `You are an AI interviewer. A student just explained their project: "${studentText}". Provide constructive feedback and ask follow-up questions.`;
    
    const aiText = await generateAIResponse(prompt);

    res.json({ aiText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
});

// Analyze presentation endpoint
app.post("/analyze-presentation", async (req, res) => {
  try {
    const { transcript, screenImage, ocrText } = req.body;

    if (!transcript && !screenImage && !ocrText) {
      return res.status(400).json({
        error: "Bad Request",
        details: "At least one of transcript, screenImage, or ocrText is required"
      });
    }
    
    let prompt = `You are an AI interviewer analyzing a student's project presentation. 

`;

    if (transcript) {
      prompt += `\n**Voice Transcript:**\n${transcript}\n`;
    }
    
    if (ocrText) {
      prompt += `\n**Text Extracted from Screen (Code/Documentation):**\n${ocrText}\n`;
    }
    
    if (screenImage) {
      prompt += `\n**Screen Capture:** [Image data provided]\n`;
    }

    prompt += `\nBased on this presentation, provide:
1. A summary of what the student presented
2. Technical evaluation of the code/project shown
3. Strengths and areas for improvement
4. 2-3 follow-up technical questions`;

    const analysis = await generateAIResponse(prompt);

    res.json({ 
      success: true,
      analysis,
      dataReceived: {
        hasTranscript: !!transcript,
        hasScreenImage: !!screenImage,
        hasOcrText: !!ocrText
      }
    });
  } catch (error) {
    console.error("Error analyzing presentation:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);
  
  // Send immediate acknowledgment
  socket.emit("connection_ack", { 
    message: "Connected successfully",
    socketId: socket.id 
  });

  // Start interview
  socket.on("start_interview", async (data) => {
    console.log("🎬 START_INTERVIEW event received for:", socket.id);
    console.log("📦 Data:", JSON.stringify(data, null, 2));
    
    try {
      // Log API key status
      if (!process.env.OPENAI_API_KEY) {
        console.log("⚠️  No OpenAI API key - using mock AI responses");
      }

      console.log("📝 Emitting thinking state...");
      socket.emit("ai_state_change", { state: "thinking" });

      const prompt = `You are a friendly AI interviewer conducting a technical project interview. 
      
Student info:
- Name: ${data.studentName || 'Student'}
- Project: ${data.projectType || 'Technical Project'}

Start the interview by:
1. Greeting the student warmly
2. Asking them to briefly introduce themselves
3. Asking them to explain what their project does

Keep your response concise and encouraging (max 3-4 sentences).`;

      console.log("🤖 Calling OpenAI API...");
      const greeting = await generateAIResponse(prompt);
      
      console.log("✅ Got AI response:", greeting.substring(0, 100) + "...");

      socket.emit("ai_state_change", { state: "speaking" });
      socket.emit("ai_message", {
        message: greeting,
        timestamp: new Date().toISOString()
      });
      
      setTimeout(() => {
        socket.emit("ai_state_change", { state: "listening" });
        console.log("✅ Interview started successfully");
      }, 2000);

    } catch (error) {
      console.error("❌ Error starting interview:", error.message);
      console.error("Full error:", error);
      socket.emit("interview_error", {
        message: "Failed to start interview",
        details: error.message
      });
    }
  });

  // Handle user responses
  socket.on("user_response", async (data) => {
    console.log("💬 USER_RESPONSE event received:", data.message);
    
    try {
      socket.emit("ai_state_change", { state: "thinking" });

      const prompt = `You are an AI interviewer. The student just said: "${data.message}"

Respond naturally and:
1. Acknowledge their answer
2. Ask a relevant follow-up question about their project
3. Keep it conversational and encouraging

Keep your response concise (2-3 sentences).`;

      console.log("🤖 Processing user response...");
      const aiResponse = await generateAIResponse(prompt);

      console.log("✅ AI response ready");
      socket.emit("ai_state_change", { state: "speaking" });
      socket.emit("ai_message", {
        message: aiResponse,
        timestamp: new Date().toISOString()
      });
      
      setTimeout(() => {
        socket.emit("ai_state_change", { state: "listening" });
      }, 2000);

    } catch (error) {
      console.error("❌ Error processing response:", error.message);
      socket.emit("interview_error", {
        message: "Failed to process response",
        details: error.message
      });
      socket.emit("ai_state_change", { state: "listening" });
    }
  });

  // Handle presentation data
  socket.on("presentation_data", async (data) => {
    console.log("📊 PRESENTATION_DATA event received");
    console.log("   Has transcript:", !!data.transcript, "length:", data.transcript?.length);
    console.log("   Has screen image:", !!data.screenImage);
    console.log("   Has OCR text:", !!data.ocrText, "length:", data.ocrText?.length);
    
    try {
      socket.emit("ai_state_change", { state: "analyzing" });
      
      let prompt = `You are an AI technical interviewer analyzing a student's project presentation.

`;

      if (data.transcript) {
        prompt += `**Verbal Presentation:**\n${data.transcript}\n\n`;
      }
      
      if (data.ocrText) {
        prompt += `**Code/Documentation Visible:**\n${data.ocrText}\n\n`;
      }

      prompt += `Based on the presentation above, generate EXACTLY 5 technical interview questions.

Requirements:
1. Questions should be specific to what was presented
2. Cover different aspects: architecture, implementation, scalability, security, and best practices
3. Each question should probe deeper understanding
4. Format as a numbered list (Q1, Q2, Q3, Q4, Q5)
5. Keep questions clear and focused

Example format:
Q1: [Architecture question about their design choices]
Q2: [Implementation detail about specific code/feature shown]
Q3: [Scalability question about handling growth]
Q4: [Security consideration for their solution]
Q5: [Best practices or alternative approaches]

Generate the 5 questions now:`;

      console.log("🤖 Analyzing presentation and generating questions...");
      const questionsText = await generateAIResponse(prompt);

      console.log("✅ Analysis complete, 5 questions generated");
      console.log("📄 Response preview:", questionsText.substring(0, 200));
      
      // Parse questions
      const questions = [];
      const lines = questionsText.split('\n');
      let currentQuestion = '';
      
      for (const line of lines) {
        console.log("Checking line:", line.substring(0, 50));
        if (line.match(/^Q[1-5][:.]?\s*/i)) {
          console.log("✅ Found question marker!");
          if (currentQuestion) questions.push(currentQuestion.trim());
          currentQuestion = line.replace(/^Q[1-5][:.]?\s*/i, '');
        } else if (currentQuestion && line.trim()) {
          currentQuestion += ' ' + line.trim();
        }
      }
      if (currentQuestion) questions.push(currentQuestion.trim());

      console.log(`📝 Parsed ${questions.length} questions:`, questions.map(q => q.substring(0, 50)));

      socket.emit("ai_state_change", { state: "speaking" });
      socket.emit("questions_generated", {
        questions: questions.slice(0, 5), // Ensure only 5 questions
        fullAnalysis: questionsText,
        timestamp: new Date().toISOString()
      });
      
      setTimeout(() => {
        socket.emit("ai_state_change", { state: "listening" });
      }, 2000);

    } catch (error) {
      console.error("❌ Error analyzing presentation:", error.message);
      socket.emit("interview_error", {
        message: "Failed to analyze presentation",
        details: error.message
      });
      socket.emit("ai_state_change", { state: "listening" });
    }
  });

  // Handle Q&A session - answer to a question
  socket.on("answer_question", async (data) => {
    console.log("💬 ANSWER_QUESTION event received");
    console.log("   Question index:", data.questionIndex);
    console.log("   Answer:", data.answer?.substring(0, 100));
    
    try {
      socket.emit("ai_state_change", { state: "thinking" });
      
      const prompt = `You are an AI interviewer. The student just answered this question:

**Question:** ${data.question}

**Student's Answer:** ${data.answer}

Provide:
1. Brief acknowledgment (positive and encouraging)
2. Follow-up point or clarification if needed (optional, 1 sentence)
3. Confirmation to move to next question

Keep response concise (2-3 sentences max).`;

      console.log("🤖 Evaluating answer...");
      const feedback = await generateAIResponse(prompt);

      console.log("✅ Feedback generated");
      
      socket.emit("ai_state_change", { state: "speaking" });
      socket.emit("answer_feedback", {
        feedback: feedback,
        questionIndex: data.questionIndex,
        timestamp: new Date().toISOString()
      });
      
      setTimeout(() => {
        socket.emit("ai_state_change", { state: "listening" });
      }, 2000);

    } catch (error) {
      console.error("❌ Error processing answer:", error.message);
      socket.emit("interview_error", {
        message: "Failed to process answer",
        details: error.message
      });
      socket.emit("ai_state_change", { state: "listening" });
    }
  });

  // Generate final interview report
  socket.on("generate_report", async (data) => {
    console.log("📊 GENERATE_REPORT event received");
    console.log("   Total Q&A pairs:", data.qaHistory?.length);
    
    try {
      socket.emit("ai_state_change", { state: "analyzing" });
      
      // Build QA history string
      let qaText = '';
      if (data.qaHistory && data.qaHistory.length > 0) {
        qaText = data.qaHistory.map((qa, i) => 
          `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}\n`
        ).join('\n');
      }
      
      const prompt = `You are an AI interviewer generating a comprehensive evaluation report.

**Student Information:**
- Name: ${data.studentName || 'Student'}
- Project: ${data.projectTitle || 'Project'}

**Presentation Summary:**
${data.presentationSummary || 'Student presented their project with screen sharing and voice explanation.'}

**Interview Q&A:**
${qaText}

Generate a detailed evaluation report with:

1. **Overall Score** (0-100): Based on technical depth, clarity, and implementation quality

2. **Section Breakdown** (each 0-100):
   - Technical Depth
   - Clarity of Explanation
   - Implementation Quality
   - Problem-Solving Approach

3. **Strengths** (3-4 bullet points): Specific positive observations

4. **Areas for Improvement** (3-4 bullet points): Constructive feedback with actionable suggestions

5. **Summary** (2-3 sentences): Overall assessment

Format as JSON:
{
  "overallScore": 85,
  "sections": {
    "technicalDepth": 82,
    "clarity": 88,
    "implementation": 75,
    "problemSolving": 85
  },
  "strengths": ["point 1", "point 2", "point 3"],
  "improvements": ["point 1", "point 2", "point 3"],
  "summary": "Overall assessment text"
}`;

      console.log("🤖 Generating comprehensive report...");
      const reportText = await generateAIResponse(prompt);

      console.log("✅ Report generated");
      
      // Try to parse JSON from response
      let reportData;
      try {
        const jsonMatch = reportText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch (parseError) {
        console.warn("⚠️  Could not parse JSON, using default structure");
        reportData = {
          overallScore: 75,
          sections: {
            technicalDepth: 75,
            clarity: 75,
            implementation: 75,
            problemSolving: 75
          },
          strengths: ["Good presentation", "Clear explanation", "Functional implementation"],
          improvements: ["Consider scalability", "Add error handling", "Improve code structure"],
          summary: reportText.substring(0, 300)
        };
      }

      socket.emit("report_generated", {
        report: reportData,
        rawReport: reportText,
        timestamp: new Date().toISOString()
      });
      
      socket.emit("ai_state_change", { state: "idle" });
      console.log("✅ Report sent to client");

    } catch (error) {
      console.error("❌ Error generating report:", error.message);
      socket.emit("interview_error", {
        message: "Failed to generate report",
        details: error.message
      });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, "Reason:", reason);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", socket.id, error);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready for connections`);
});
