import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import { updateCustomerPassword } from "@/lib/auth/customer-store";
import { consumePasswordResetToken, getPasswordResetEmail } from "@/lib/auth/password-reset-store";

function validatePassword(password: unknown) {
  if (typeof password !== "string") return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

export async function POST(request: NextRequest) {
    const ip = getClientIp(request.headers)
    const rateLimit = await checkRateLimit('reset-password:' + ip, {
      max: 10,
      windowMs: 3600000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)) } })
    }
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const passwordError = validatePassword(body.password);

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const email = await getPasswordResetEmail(token);
    if (!email) {
      return NextResponse.json({ error: "Reset link is invalid or expired" }, { status: 400 });
    }

    const updated = await updateCustomerPassword(email, body.password);
    if (!updated) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await consumePasswordResetToken(token);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
