import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import { getCustomerUser } from "@/lib/auth/customer-store";
import { createPasswordResetToken } from "@/lib/auth/password-reset-store";
import { SITE_URL } from "@/lib/site-url";

function emailJsConfigured() {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID?.trim() &&
    process.env.EMAILJS_PUBLIC_KEY?.trim() &&
    process.env.EMAILJS_PASSWORD_RESET_TEMPLATE_ID?.trim()
  );
}

function getResetPath(value: unknown) {
  if (value === "/ui/auth/reset-password") return "/ui/auth/reset-password";
  return "/reset-password";
}
async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  resetUrl: string;
  expiresAt: string;
}) {
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: SITE_URL,
    },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_PASSWORD_RESET_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: input.email,
        email: input.email,
        user_email: input.email,
        name: input.name,
        user_name: input.name,
        reset_url: input.resetUrl,
        reset_link: input.resetUrl,
        expires_at: input.expiresAt,
        site_name: "mtverse",
        website: SITE_URL,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Password reset email failed.");
  }
}

export async function POST(request: NextRequest) {
    const ip = getClientIp(request.headers)
    const rateLimit = await checkRateLimit('forgot-password:' + ip, {
      max: 3,
      windowMs: 3600000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)) } })
    }
  try {
    const body = await request.json();
    const { email, resetPath } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!emailJsConfigured()) {
      return NextResponse.json(
        { error: "Password reset email is not configured yet." },
        { status: 503 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await getCustomerUser(normalizedEmail);

    if (user) {
      const reset = await createPasswordResetToken(normalizedEmail);
      const resetUrl = `${SITE_URL.replace(/\/+$/g, "")}${getResetPath(resetPath)}?token=${encodeURIComponent(reset.token)}`;

      await sendPasswordResetEmail({
        email: normalizedEmail,
        name: user.name,
        resetUrl,
        expiresAt: reset.expiresAt,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Reset link sent",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request body" },
      { status: 400 }
    );
  }
}
