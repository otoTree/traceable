import OpenAI from "openai";

// Prioritize OpenRouter configuration if available, otherwise fallback to OpenAI standard
const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENROUTER_API_KEY 
  ? "https://openrouter.ai/api/v1" 
  : (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1");

const openai = new OpenAI({
  apiKey,
  baseURL
});

export default openai;
