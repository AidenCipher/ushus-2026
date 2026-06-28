import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("Global Setup: Initializing test database...");
  const testDbUrl = process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ushus_test";
  
  // Enforce environment variable for subsequent test runs
  process.env.DATABASE_URL = testDbUrl;
  process.env.DIRECT_URL = testDbUrl;

  try {
    // Run db push to synchronize the schema without full migration overhead
    execSync("npx prisma db push --accept-data-loss", {
      env: {
        ...process.env,
        DATABASE_URL: testDbUrl,
      },
      stdio: "pipe",
    });
    console.log("Global Setup: Test database synchronized successfully.");
  } catch (error) {
    console.error("Global Setup: Test database synchronization failed:", error);
    throw error;
  }
}
