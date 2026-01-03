import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  defaultHeaders: {
    "HTTP-Referer": "https://traceable.ai", // Optional, for OpenRouter rankings
    "X-Title": "Traceable AI", // Optional, for OpenRouter rankings
  },
});

export default openai;
