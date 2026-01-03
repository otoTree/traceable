import OpenAI from "openai";

// Prioritize OpenRouter configuration if available, otherwise fallback to OpenAI standard
const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL
  

const openai = new OpenAI({
  apiKey,
  baseURL
});

export default openai;
