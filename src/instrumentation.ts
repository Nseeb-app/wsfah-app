import { execSync } from "child_process";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      console.log("Running prisma db push...");
      execSync("npx prisma db push --skip-generate", {
        stdio: "inherit",
        timeout: 30000,
      });
      console.log("Prisma db push completed.");
    } catch (err) {
      console.error("Prisma db push failed:", err);
    }
  }
}
