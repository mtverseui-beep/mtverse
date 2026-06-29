import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_TTL_SECONDS,
} from "@/lib/auth/customer-session";
import { createCustomerUser, isValidEmail } from "@/lib/auth/customer-store";

export async function POST(request: NextRequest) {
    const ip = getClientIp(request.headers)
    const rateLimit = await checkRateLimit('customer-signup:' + ip, {
      max: 5,
      windowMs: 900000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)) } })
    }
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    const result = await createCustomerUser({ name, email, password });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
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

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
