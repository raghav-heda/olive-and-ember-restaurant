import { headers } from "next/headers";

/**
 * Dynamically resolves the canonical base URL for the application across:
 * - Client browser origin (e.g. when passed from client component)
 * - Dynamic incoming request headers (x-forwarded-host, host, x-forwarded-proto)
 * - Server Component next/headers()
 * - Production environment variable or Vercel production domain
 * - Localhost development default (http://localhost:3000)
 */
export function resolveAppBaseUrl(options?: {
  req?: Request;
  customHeaders?: Headers;
  clientOrigin?: string;
}): string {
  // 1. Explicit client browser origin if valid and not empty
  if (options?.clientOrigin && typeof options.clientOrigin === "string") {
    const trimmed = options.clientOrigin.trim().replace(/\/$/, "");
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
  }

  // 2. Inspect Headers from incoming Request or explicitly passed customHeaders
  const hdrs = options?.customHeaders || (options?.req ? options.req.headers : undefined);
  if (hdrs) {
    const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
    if (host) {
      const proto =
        hdrs.get("x-forwarded-proto") ||
        (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  // 3. In Server Component context, attempt reading next/headers safely
  try {
    const serverHeaders = headers();
    const host = serverHeaders.get("x-forwarded-host") || serverHeaders.get("host");
    if (host) {
      const proto =
        serverHeaders.get("x-forwarded-proto") ||
        (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // headers() throws in non-SSR or static contexts; catch gracefully
  }

  // 4. Vercel Canonical Production Domain (auto-injected by Vercel for production branch)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  }

  // 5. Explicit production environment variable (e.g. custom domain or production URL)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl && typeof envUrl === "string") {
    const cleanEnv = envUrl.trim().replace(/\/$/, "");
    if (process.env.NODE_ENV === "production") {
      if (!cleanEnv.includes("localhost") && !cleanEnv.includes("127.0.0.1")) {
        return cleanEnv.startsWith("http") ? cleanEnv : `https://${cleanEnv}`;
      }
    } else {
      return cleanEnv.startsWith("http") ? cleanEnv : `http://${cleanEnv}`;
    }
  }

  // 6. Vercel deployment URL fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  // 7. Local development default
  return "http://localhost:3000";
}
