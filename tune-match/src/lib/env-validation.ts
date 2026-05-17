/**
 * Environment variable validation utility
 * Ensures all required env vars are present and valid before app runs
 */

export type EnvConfig = {
  DATABASE_URL: string;
  WEBSOCKET_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  NODE_ENV: "development" | "production" | "test";
};

/**
 * Validates that all required environment variables are set
 * Throws error if any are missing
 */
export function validateEnv(): EnvConfig {
  const required: Array<keyof EnvConfig> = [
    "DATABASE_URL",
    "WEBSOCKET_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file and ensure all variables are set.",
    );
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL!;
  if (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://")) {
    throw new Error(
      "Invalid DATABASE_URL: must be a PostgreSQL connection string",
    );
  }

  // Validate WEBSOCKET_URL format
  const wsUrl = process.env.WEBSOCKET_URL!;
  if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
    throw new Error("Invalid WEBSOCKET_URL: must start with ws:// or wss://");
  }

  return {
    DATABASE_URL: dbUrl,
    WEBSOCKET_URL: wsUrl,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
  };
}

/**
 * Get validated environment config
 * Caches result to avoid repeated validation
 */
let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
