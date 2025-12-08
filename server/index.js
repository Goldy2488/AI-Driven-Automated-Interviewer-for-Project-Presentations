import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Routes
app.use("/analyze-screen", analyzeRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI interviewer backend listening on http://localhost:${PORT}`);
});