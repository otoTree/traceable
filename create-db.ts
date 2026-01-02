import { Client } from "pg";

async function main() {
  const connectionString = "postgresql://postgres:dd846f97@dbconn.sealosbja.site:41354/postgres";
  const client = new Client({ connectionString });

  try {
    console.log("Connecting to postgres database...");
    await client.connect();
    console.log("Connected. Creating traceable database...");
    await client.query("CREATE DATABASE traceable");
    console.log("Database traceable created.");
  } catch (error: any) {
    if (error.code === "42P04") {
      console.log("Database traceable already exists.");
    } else {
      console.error("Failed to create database:", error);
    }
  } finally {
    await client.end();
  }
}

main();
