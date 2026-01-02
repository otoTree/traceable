import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

const SUGGEST_PROMPT = `
你是一个专业的笔迹心理分析助手。基于当前的对话内容，请给出 3-4 个用户可能想继续追问的问题。
这些问题应该：
1. 与笔迹分析、心理状态、性格特质或后续建议相关。
2. 简短、自然、具有启发性。
3. 能够引导用户更深入地了解自己。

请直接返回 JSON 数组格式，例如：
["我的笔迹中体现的压力来源是什么？", "如何通过改善笔迹来调整心态？", "这种性格在职场中有什么优势？"]

只返回 JSON 数组，不要包含任何解释或 Markdown 格式。`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // Only take the last few messages to provide context without overloading
    const contextMessages = messages.slice(-5);

    const apiMessages = [
      { role: "system", content: SUGGEST_PROMPT },
      ...contextMessages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: apiMessages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "[]";
    
    try {
      // Clean up the content in case the LLM added markdown or extra text
      const cleanedContent = content.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const suggestions = JSON.parse(cleanedContent);
      return NextResponse.json({ suggestions });
    } catch (parseError) {
      console.error("Failed to parse suggestions:", content);
      return NextResponse.json({ suggestions: [] });
    }
  } catch (error: any) {
    console.error("Suggest API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
