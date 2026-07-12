import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import { createAuthErrorId, recordAuthEvent } from "@/lib/auth/auth-event-log";
import { updateCustomerPassword } from "@/lib/auth/customer-store";
import { consumePasswordResetToken } from "@/lib/auth/password-reset-store";

function validatePassword(password: unknown) {
  if (typeof password !== "string") return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

function failureResponse(error: string, status: number, errorId: string, headers?: HeadersInit) {
  return NextResponse.json({ error, errorId }, { status, headers })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit('reset-password:' + ip, {
    max: 10,
    windowMs: 3600000,
  })

  if (!rateLimit.allowed) {
    const errorId = createAuthErrorId()
    await recordAuthEvent({ request, type: 'reset_password', status: 'blocked', provider: 'email', reason: 'rate_limited', message: 'Password reset confirmation blocked by rate limit.', errorId })
    return failureResponse('Too many requests. Please try again later.', 429, errorId, {
      'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
    })
  }

  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const passwordError = validatePassword(body.password);

    if (!token) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'reset_password', status: 'failure', provider: 'email', reason: 'token_required', message: 'Password reset confirmation failed because token was missing.', errorId })
      return failureResponse("Reset token is required", 400, errorId);
    }

    if (passwordError) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'reset_password', status: 'failure', provider: 'email', reason: 'weak_password', message: passwordError, errorId })
      return failureResponse(passwordError, 400, errorId);
    }

    const email = await consumePasswordResetToken(token);
    if (!email) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'reset_password', status: 'failure', provider: 'email', reason: 'invalid_or_expired_token', message: 'Password reset confirmation failed because token was invalid or expired.', errorId })
      return failureResponse("Reset link is invalid or expired", 400, errorId);
    }

    const updated = await updateCustomerPassword(email, body.password);
    if (!updated) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'reset_password', status: 'failure', provider: 'email', email, reason: 'account_not_found', message: 'Password reset confirmation failed because account was not found.', errorId })
      return failureResponse("Account not found", 404, errorId);
    }

    await recordAuthEvent({ request, type: 'reset_password', status: 'success', provider: 'email', email, reason: 'password_updated', message: 'Password updated successfully.' })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch {
    const errorId = createAuthErrorId()
    await recordAuthEvent({ request, type: 'reset_password', status: 'failure', provider: 'email', reason: 'invalid_request_body', message: 'Password reset confirmation failed because request body could not be parsed.', errorId })
    return failureResponse("Invalid request body", 400, errorId);
  }
}
