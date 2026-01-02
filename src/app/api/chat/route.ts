import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      stream: false, // Keeping it simple for now, can be changed to stream if needed
    });

    const assistantMessage = response.choices[0].message;

    return NextResponse.json(assistantMessage);
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
