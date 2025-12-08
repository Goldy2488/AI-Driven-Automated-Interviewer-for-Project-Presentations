import express from "express";
import { analyzeScreen } from "../service/analyze.js";

const router = express.Router();

router.post("/", analyzeScreen);

export default router;
