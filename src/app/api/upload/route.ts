import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = file.name.split(".").pop();
    const filename = `uploads/${uuidv4()}.${extension}`;

    const bucketName = process.env.S3_BUCKET;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    
    // Construct the URL. 
    // If using a custom endpoint or specific S3 provider, the URL format might vary.
    // Standard format: https://{bucket}.{endpoint}/{key} or https://{endpoint}/{bucket}/{key}
    
    let url = "";
    const endpoint = process.env.S3_ENDPOINT || "";
    const cleanEndpoint = endpoint.replace(/^https?:\/\//, "");
    const protocol = endpoint.startsWith("http://") ? "http" : "https";

    // Sealos OSS typically uses path style: https://{endpoint}/{bucket}/{key}
    // We force this to match our s3Client configuration in lib/s3.ts
    url = `${protocol}://${cleanEndpoint}/${bucketName}/${filename}`;
    
    // If a public URL override is provided (e.g., CDN), use that instead
    if (process.env.S3_PUBLIC_URL) {
      url = `${process.env.S3_PUBLIC_URL}/${filename}`;
    }
    
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
