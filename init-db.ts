import { initDb } from "./src/lib/schema";

async function main() {
  try {
    console.log("Initializing database...");
    await initDb();
    console.log("Database initialized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

main();
