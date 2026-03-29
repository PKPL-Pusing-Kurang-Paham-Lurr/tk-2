import { db } from "@tk2-pkpl/db";
import { auditLog } from "@tk2-pkpl/db/schema/auth";

export const AuditAction = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  SESSION_REVOKED: "SESSION_REVOKED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  ACCOUNT_DELETED: "ACCOUNT_DELETED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  OAUTH_CALLBACK_SUCCESS: "OAUTH_CALLBACK_SUCCESS",
  OAUTH_CALLBACK_FAILED: "OAUTH_CALLBACK_FAILED",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

export interface AuditLogParams {
  action: AuditActionType;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function logAuthEvent({
  action,
  userId = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
}: AuditLogParams) {
  const [entry] = await db
    .insert(auditLog)
    .values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      action,
      userId,
      ipAddress,
      userAgent,
      metadata,
      createdAt: new Date(),
    })
    .returning();

  return entry;
}

export const auditLoggerPlugin = {
  name: "audit-logger",
  hooks: {
    after: async (context: {
      path: string;
      method: string;
      body?: unknown;
      user?: { id: string };
      request?: Request;
      response?: Response;
    }) => {
      const { path, method, user, request } = context;

      const ipAddress = request?.headers.get("x-forwarded-for")
        ?? request?.headers.get("x-real-ip")
        ?? null;
      const userAgent = request?.headers.get("user-agent") ?? null;

      if (path === "/sign-in" && method === "POST" && user) {
        await logAuthEvent({
          action: AuditAction.LOGIN_SUCCESS,
          userId: user.id,
          ipAddress,
          userAgent,
        });
      } else if (path === "/sign-out" && method === "POST" && user) {
        await logAuthEvent({
          action: AuditAction.LOGOUT,
          userId: user.id,
          ipAddress,
          userAgent,
        });
      } else if (path === "/session" && method === "DELETE" && user) {
        await logAuthEvent({
          action: AuditAction.SESSION_REVOKED,
          userId: user.id,
          ipAddress,
          userAgent,
        });
      }
    },
    onError: async (context: {
      path: string;
      method: string;
      error?: { message: string };
      request?: Request;
    }) => {
      const { path, method, request } = context;

      const ipAddress = request?.headers.get("x-forwarded-for")
        ?? request?.headers.get("x-real-ip")
        ?? null;
      const userAgent = request?.headers.get("user-agent") ?? null;

      if (path === "/sign-in" && method === "POST") {
        await logAuthEvent({
          action: AuditAction.LOGIN_FAILED,
          ipAddress,
          userAgent,
          metadata: { error: context.error?.message ?? "Unknown error" },
        });
      }
    },
  },
} as const;
