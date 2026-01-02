import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");

async function getUserId(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  const token = authHeader.split(" ")[1];
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as number;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get("analysisId");

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 });
    }

    const result = await query(
      "SELECT * FROM messages WHERE analysis_id = $1 AND user_id = $2 ORDER BY created_at ASC",
      [analysisId, userId]
    );

    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysisId, role, content } = await req.json();

    if (!analysisId || !role || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO messages (analysis_id, user_id, role, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [analysisId, userId, role, content]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Save message error:", error);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
