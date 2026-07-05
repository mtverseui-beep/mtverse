import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_TTL_SECONDS,
} from "@/lib/auth/customer-session";
import { createCustomerUser, isValidEmail } from "@/lib/auth/customer-store";
import { createAuthErrorId, recordAuthEvent } from "@/lib/auth/auth-event-log";

function failureResponse(error: string, status: number, errorId: string, headers?: HeadersInit) {
  return NextResponse.json({ error, errorId }, { status, headers })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit('customer-signup:' + ip, {
    max: 5,
    windowMs: 900000,
  })

  if (!rateLimit.allowed) {
    const errorId = createAuthErrorId()
    await recordAuthEvent({ request, type: 'sign_up', status: 'blocked', provider: 'email', reason: 'rate_limited', message: 'Email sign-up blocked by rate limit.', errorId })
    return failureResponse('Too many requests. Please try again later.', 429, errorId, {
      'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
    })
  }

  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', email, reason: 'name_required', message: 'Email sign-up failed because name was missing.', errorId })
      return failureResponse("Name is required", 400, errorId);
    }

    if (!email || typeof email !== "string") {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', reason: 'email_required', message: 'Email sign-up failed because email was missing.', errorId })
      return failureResponse("Email is required", 400, errorId);
    }

    if (!password || typeof password !== "string") {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', email, reason: 'password_required', message: 'Email sign-up failed because password was missing.', errorId })
      return failureResponse("Password is required", 400, errorId);
    }

    if (!isValidEmail(email)) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', email, reason: 'invalid_email', message: 'Email sign-up failed because email format was invalid.', errorId })
      return failureResponse("Invalid email format", 400, errorId);
    }

    if (password.length < 8) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', email, reason: 'weak_password_length', message: 'Email sign-up failed because password was too short.', errorId })
      return failureResponse("Password must be at least 8 characters", 400, errorId);
    }

    if (!/[A-Z]/.test(password)) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', email, reason: 'weak_password_uppercase', message: 'Email sign-up failed because password had no uppercase letter.', errorId })
      return failureResponse("Password must contain at least one uppercase letter", 400, errorId);
    }

    if (!/[0-9]/.test(password)) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', email, reason: 'weak_password_number', message: 'Email sign-up failed because password had no number.', errorId })
      return failureResponse("Password must contain at least one number", 400, errorId);
    }

    const result = await createCustomerUser({ name, email, password });

    if (!result.ok) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', email, reason: 'account_exists', message: 'Email sign-up failed because account already exists.', errorId })
      return failureResponse(result.error, 409, errorId);
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: "Account created successfully",
    });

    response.cookies.set(
      CUSTOMER_SESSION_COOKIE,
      createCustomerSessionToken(result.user),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: CUSTOMER_SESSION_TTL_SECONDS,
        path: "/",
      }
    );

    await recordAuthEvent({
      request,
      type: 'sign_up',
      status: 'success',
      provider: 'email',
      email: result.user.email,
      reason: 'email_sign_up',
      message: 'Email account created and signed in.',
    })

    return response;
  } catch {
    const errorId = createAuthErrorId()
    await recordAuthEvent({ request, type: 'sign_up', status: 'failure', provider: 'email', reason: 'invalid_request_body', message: 'Email sign-up failed because request body could not be parsed.', errorId })
    return failureResponse("Invalid request body", 400, errorId);
  }
}