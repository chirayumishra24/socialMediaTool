import { defineConfig } from "drizzle-kit";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
