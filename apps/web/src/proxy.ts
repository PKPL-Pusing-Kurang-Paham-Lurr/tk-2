import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitState {
  entries: Map<string, RateLimitEntry>;
  cleanupCount: number;
}

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const CLEANUP_THRESHOLD = 1000;

const rateLimitStore: Map<string, RateLimitEntry> = new Map();
let totalEntriesAdded = 0;

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIP = forwardedFor.split(",")[0].trim();
    if (clientIP) return clientIP;
  }

  const ip = (request as NextRequest & { ip?: string }).ip;
  if (ip) return ip;

  return "unknown";
}

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function cleanExpiredTimestamps(entry: RateLimitEntry, now: number): void {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
}

function cleanupStore(): number {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  let cleanedCount = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    const validTimestamps = entry.timestamps.filter((ts) => ts > windowStart);
    cleanedCount += entry.timestamps.length - validTimestamps.length;

    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
      cleanedCount++;
    } else {
      entry.timestamps = validTimestamps;
    }
  }

  return cleanedCount;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  cleanExpiredTimestamps(entry, now);

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.timestamps.push(now);
  totalEntriesAdded++;

  if (totalEntriesAdded % CLEANUP_THRESHOLD === 0) {
    cleanupStore();
  }

  return true;
}

export function getRateLimitState(): RateLimitState {
  return {
    entries: new Map(rateLimitStore),
    cleanupCount: totalEntriesAdded,
  };
}

export function resetRateLimitStore(): void {
  rateLimitStore.clear();
  totalEntriesAdded = 0;
}

export function getRemainingRequests(key: string): number {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return RATE_LIMIT_MAX;
  }

  cleanExpiredTimestamps(entry, now);
  return Math.max(0, RATE_LIMIT_MAX - entry.timestamps.length);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const clientIP = getClientIP(request);
  const rateLimitKey = getRateLimitKey(clientIP, pathname);

  if (!checkRateLimit(rateLimitKey)) {
    const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);

    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
        remaining: 0,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(
            Math.ceil((Date.now() + RATE_LIMIT_WINDOW_MS) / 1000)
          ),
        },
      }
    );
  }

  const remaining = getRemainingRequests(rateLimitKey);
  const response = NextResponse.next();

  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil((Date.now() + RATE_LIMIT_WINDOW_MS) / 1000))
  );

  return response;
}

export const config = {
  matcher: ["/api/auth/:path*"],
};
