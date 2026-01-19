const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log("🔍 Fetching available Gemini models...\n");
    
    // Try to list models
    const models = await genAI.listModels();
    
    console.log("✅ Available models:");
    models.forEach((model) => {
      console.log(`  - ${model.name}`);
      console.log(`    Display Name: ${model.displayName}`);
      console.log(`    Supported: ${model.supportedGenerationMethods.join(", ")}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error listing models:", error.message);
    console.log("\n🔧 Trying common model names...\n");
    
    // Try common model names
    const modelsToTry = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro-vision",
      "models/gemini-pro",
      "models/gemini-1.5-pro"
    ];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ ${modelName} - WORKS!`);
      } catch (err) {
        console.log(`❌ ${modelName} - ${err.message.substring(0, 100)}`);
      }
    }
  }
}

listModels();
