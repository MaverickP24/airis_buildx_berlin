const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const modelsToTest = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05", // Sometimes specific versions work
  "gemini-flash-latest" // Alias
];

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
      console.error("No API KEY found in .env");
      return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  console.log(`Testing ${modelsToTest.length} models with key ending in ...${apiKey.slice(-4)}`);

  for (const modelName of modelsToTest) {
    console.log(`\n--- Testing ${modelName} ---`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'OK'");
        const response = await result.response;
        console.log(`✅ SUCCESS with ${modelName}:`, response.text());
        console.log(`>>> RECOMMENDATION: Use '${modelName}'`);
        process.exit(0); // Exit on first success to save time/quota
    } catch (e) {
        let msg = e.message;
        if (msg.includes("404")) msg = "404 Not Found (Model unavailable)";
        if (msg.includes("429")) msg = "429 Quota Exceeded";
        console.log(`❌ FAILED ${modelName}: ${msg}`);
    }
  }
  
  console.log("\n❌ All models failed. Please check your API key permissions or billing.");
}

testModels();
