import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET || "",
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", // Useful for some S3-compatible services
});

export default s3Client;
