import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import { createAuthErrorId, recordAuthEvent } from "@/lib/auth/auth-event-log";
import { getCustomerUser } from "@/lib/auth/customer-store";
import { createPasswordResetToken } from "@/lib/auth/password-reset-store";
import { passwordResetEmail } from "@/lib/email/templates";
import { isResendConfigured, sendEmail } from "@/lib/email/resend";
import { SITE_URL } from "@/lib/site-url";

function getResetPath(value: unknown) {
  if (value === "/ui/auth/reset-password") return "/ui/auth/reset-password";
  return "/reset-password";
}

function failureResponse(error: string, status: number, errorId: string, headers?: HeadersInit) {
  return NextResponse.json({ error, errorId }, { status, headers })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit('forgot-password:' + ip, {
    max: 3,
    windowMs: 3600000,
  })

  if (!rateLimit.allowed) {
    const errorId = createAuthErrorId()
    await recordAuthEvent({ request, type: 'forgot_password', status: 'blocked', provider: 'email', reason: 'rate_limited', message: 'Password reset request blocked by rate limit.', errorId })
    return failureResponse('Too many requests. Please try again later.', 429, errorId, {
      'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
    })
  }

  try {
    const body = await request.json();
    const { email, resetPath } = body;

    if (!email || typeof email !== "string") {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'forgot_password', status: 'failure', provider: 'email', reason: 'email_required', message: 'Password reset request failed because email was missing.', errorId })
      return failureResponse("Email is required", 400, errorId);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'forgot_password', status: 'failure', provider: 'email', email, reason: 'invalid_email', message: 'Password reset request failed because email format was invalid.', errorId })
      return failureResponse("Invalid email format", 400, errorId);
    }

    if (!isResendConfigured()) {
      const errorId = createAuthErrorId()
      await recordAuthEvent({ request, type: 'forgot_password', status: 'failure', provider: 'email', email, reason: 'resend_not_configured', message: 'Password reset email could not send because Resend is not configured.', errorId })
      return failureResponse("Password reset email is not configured yet.", 503, errorId);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await getCustomerUser(normalizedEmail);

    if (user) {
      const reset = await createPasswordResetToken(normalizedEmail);
      const resetUrl = `${SITE_URL.replace(/\/+$/g, "")}${getResetPath(resetPath)}?token=${encodeURIComponent(reset.token)}`;
      const content = passwordResetEmail({ name: user.name, resetUrl });

      await sendEmail({
        to: normalizedEmail,
        ...content,
        tags: [{ name: 'category', value: 'password-reset' }],
      });

      await recordAuthEvent({ request, type: 'forgot_password', status: 'success', provider: 'email', email: normalizedEmail, reason: 'reset_email_sent', message: 'Password reset link sent.' })
    } else {
      await recordAuthEvent({ request, type: 'forgot_password', status: 'success', provider: 'email', email: normalizedEmail, reason: 'account_not_found_masked', message: 'Password reset requested for an email with no account. Public response was still successful.' })
    }

    return NextResponse.json({
      success: true,
      message: "Reset link sent",
    });
  } catch (error) {
    const errorId = createAuthErrorId()
    await recordAuthEvent({ request, type: 'forgot_password', status: 'failure', provider: 'email', reason: 'reset_email_failed', message: error instanceof Error ? error.message : 'Password reset request failed.', errorId })
    return failureResponse("We could not send the reset email. Please try again shortly.", 500, errorId);
  }
}
