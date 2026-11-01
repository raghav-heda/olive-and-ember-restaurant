import { PrismaClient } from "@prisma/client";

/**
 * Resolves the optimal database connection URL for serverless environments.
 * Prioritizes connection-pooled endpoints (e.g. POSTGRES_PRISMA_URL) in production/Vercel
 * to prevent connection exhaustion. Sets an appropriate connection limit parameter
 * if PostgreSQL is used in a serverless function.
 */
function resolveDatabaseUrl(): string | undefined {
  // 1. Prefer pooled connection URL in serverless/production if available.
  // Vercel Postgres sets POSTGRES_PRISMA_URL as the pooled connection string (port 6543 / pgbouncer)
  const poolUrl = process.env.POSTGRES_PRISMA_URL;
  const directUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  let chosenUrl = poolUrl || directUrl;
  if (!chosenUrl) return undefined;

  // In PostgreSQL, tune connection_limit for serverless environments to avoid pool exhaustion
  if (
    (chosenUrl.startsWith("postgres://") ||
      chosenUrl.startsWith("postgresql://") ||
      chosenUrl.startsWith("prisma+postgres://")) &&
    !chosenUrl.includes("connection_limit=")
  ) {
    const separator = chosenUrl.includes("?") ? "&" : "?";
    // Set a safe connection limit per serverless function instance (default 2)
    const limit = process.env.PRISMA_CONNECTION_LIMIT || "2";
    chosenUrl = `${chosenUrl}${separator}connection_limit=${limit}`;
  }

  return chosenUrl;
}

// Global declaration to maintain singleton across hot reloads & serverless warm containers
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getOrCreatePrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const resolvedUrl = resolveDatabaseUrl();
  if (resolvedUrl) {
    // Keep process.env.DATABASE_URL synchronized for Prisma internal references
    process.env.DATABASE_URL = resolvedUrl;
  }

  const client = new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  // CRITICAL: Cache client unconditionally across ALL environments (both production & development)
  // to prevent new PrismaClient instances from being instantiated on every request or property access.
  globalForPrisma.prisma = client;
  return client;
}

// Export the singleton PrismaClient directly
export const prisma: PrismaClient = getOrCreatePrismaClient();

export default prisma;
