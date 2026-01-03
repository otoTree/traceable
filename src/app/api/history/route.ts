import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { initDb } from "@/lib/schema";
import { jwtVerify } from "jose";
import { readFile } from "fs/promises";
import { join } from "path";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");

async function queryWithRetry(text: string, params?: any[]) {
  try {
    return await query(text, params);
  } catch (error: any) {
    // If column does not exist (42703), try to migrate and retry
    if (error.code === "42703") {
      console.log("Database schema mismatch detected, attempting to migrate...");
      await initDb();
      return await query(text, params);
    }
    throw error;
  }
}

async function urlToBase64(url: string | null) {
  if (!url) return url;
  if (url.startsWith("data:")) return url;
  
  // If it's a local upload, try to read it
  if (url.includes("/uploads/") && !url.startsWith("http")) {
    try {
      const uploadPathMatch = url.match(/\/uploads\/[^/?#]+/);
      if (!uploadPathMatch) return url;
      
      const relativePath = uploadPathMatch[0];
      const filePath = join(process.cwd(), "public", relativePath);
      const buffer = await readFile(filePath);
      const base64 = buffer.toString("base64");
      const ext = relativePath.split(".").pop()?.toLowerCase();
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error(`Error converting ${url} to base64:`, error);
      return url;
    }
  }
  
  // For remote URLs (like OSS), we can return them as is
  // The AI model can usually fetch them directly
  return url;
}

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
      const result = await queryWithRetry(
        "SELECT id, result, image1_url, image2_url, images, created_at FROM analyses WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
      }
      return NextResponse.json({ analysis: result.rows[0] });
    }

    const result = await queryWithRetry(
      "SELECT id, result, image1_url, image2_url, images, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC",
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

    const { result, image1_url, image2_url, images } = await req.json();

    if (!result) {
      return NextResponse.json({ error: "Result is required" }, { status: 400 });
    }

    // Convert URLs to base64 for persistent storage if they are local
    const base64Image1 = await urlToBase64(image1_url);
    const base64Image2 = await urlToBase64(image2_url);
    
    let processedImages = images || [];
    if (processedImages.length > 0) {
      processedImages = await Promise.all(
        processedImages.map((url: string) => urlToBase64(url))
      );
    }
    
    // Also convert any images in the result object if it has an images array
    if (result && Array.isArray(result.images)) {
      result.images = await Promise.all(
        result.images.map((url: string) => urlToBase64(url))
      );
    }

    const dbResult = await queryWithRetry(
      "INSERT INTO analyses (user_id, result, image1_url, image2_url, images) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at",
      [userId, result, base64Image1, base64Image2, processedImages]
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
