import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_REMEMBER_TTL_SECONDS,
  CUSTOMER_SESSION_TTL_SECONDS,
} from "@/lib/auth/customer-session";
import { isValidEmail, verifyCustomerCredentials } from "@/lib/auth/customer-store";
import { createAuthErrorId, recordAuthEvent } from "@/lib/auth/auth-event-log";

function failureResponse(error: string, status: number, errorId: string, headers?: HeadersInit) {
  return NextResponse.json({ error, errorId }, { status, headers })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit('customer-signin:' + ip, {
    max: 10,
    windowMs: 900000,
  })

  if (!rateLimit.allowed) {
    const errorId = createAuthErrorId()
    await recordAuthEvent({
      request,
      type: 'sign_in',
      status: 'blocked',
      provider: 'email',
      reason: 'rate_limited',
      message: 'Email sign-in blocked by rate limit.',
      errorId,
    })
    return failureResponse('Too many requests. Please try again later.', 429, errorId, {
      'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
    })
  }

  try {
    const body = await request.json();
    const { email, password, remember } = body;

    if (!email || typeof email !== "string") {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_in', status: 'failure', provider: 'email', reason: 'email_required', message: 'Email sign-in failed because email was missing.', errorId })
      return failureResponse("Email is required", 400, errorId);
    }

    if (!password || typeof password !== "string") {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_in', status: 'failure', provider: 'email', email, reason: 'password_required', message: 'Email sign-in failed because password was missing.', errorId })
      return failureResponse("Password is required", 400, errorId);
    }

    if (!isValidEmail(email)) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_in', status: 'failure', provider: 'email', email, reason: 'invalid_email', message: 'Email sign-in failed because email format was invalid.', errorId })
      return failureResponse("Invalid email format", 400, errorId);
    }

    const user = await verifyCustomerCredentials(email, password);

    if (!user) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_in', status: 'failure', provider: 'email', email, reason: 'invalid_credentials', message: 'Email sign-in failed because credentials did not match.', errorId })
      return failureResponse("Invalid credentials", 401, errorId);
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    const ttlSeconds = remember ? CUSTOMER_SESSION_REMEMBER_TTL_SECONDS : CUSTOMER_SESSION_TTL_SECONDS;

    response.cookies.set(CUSTOMER_SESSION_COOKIE, createCustomerSessionToken(user, ttlSeconds), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ttlSeconds,
      path: "/",
    });

    await recordAuthEvent({
      request,
      type: 'sign_in',
      status: 'success',
      provider: 'email',
      email: user.email,
      reason: remember ? 'email_sign_in_remembered' : 'email_sign_in',
      message: remember ? 'Email sign-in succeeded with remember me.' : 'Email sign-in succeeded.',
    })

    return response;
  } catch {
    const errorId = createAuthErrorId()
    await recordAuthEvent({ request, type: 'sign_in', status: 'failure', provider: 'email', reason: 'invalid_request_body', message: 'Email sign-in failed because request body could not be parsed.', errorId })
    return failureResponse("Invalid request body", 400, errorId);
  }
}