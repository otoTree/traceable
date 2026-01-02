import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const result = await query(
        "SELECT id, result, image1_url, image2_url, created_at FROM analyses WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
      }
      return NextResponse.json({ analysis: result.rows[0] });
    }

    const result = await query(
      "SELECT id, result, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );

    return NextResponse.json({ history: result.rows });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const { result, image1_url, image2_url } = await req.json();

    if (!result) {
      return NextResponse.json({ error: "Result is required" }, { status: 400 });
    }

    const dbResult = await query(
      "INSERT INTO analyses (user_id, result, image1_url, image2_url) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
      [userId, result, image1_url, image2_url]
    );

    return NextResponse.json({ 
      id: dbResult.rows[0].id, 
      created_at: dbResult.rows[0].created_at 
    });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}
