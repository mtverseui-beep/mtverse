import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_REMEMBER_TTL_SECONDS,
  CUSTOMER_SESSION_TTL_SECONDS,
} from "@/lib/auth/customer-session";
import { isValidEmail, verifyCustomerCredentials } from "@/lib/auth/customer-store";

export async function POST(request: NextRequest) {
    const ip = getClientIp(request.headers)
    const rateLimit = await checkRateLimit('customer-signin:' + ip, {
      max: 10,
      windowMs: 900000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)) } })
    }
  try {
    const body = await request.json();
    const { email, password, remember } = body;

    // Validate required fields
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

    const user = await verifyCustomerCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
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

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
