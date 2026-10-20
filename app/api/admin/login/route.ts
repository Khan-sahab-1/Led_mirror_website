import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminToken, setAdminCookie } from "@/lib/admin-auth";

const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
const DEFAULT_ADMIN_PASSWORD = "Mobiloitte@1";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const expectedEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim();
    const expectedPassword = (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).trim();

    const safeCompare = (x: string, y: string) => {
      const a = Buffer.from(x);
      const b = Buffer.from(y);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    };

    const inputEmail = String(email || "").trim().toLowerCase();
    const inputPassword = String(password || "").trim();

    if (
      !safeCompare(inputEmail, expectedEmail.toLowerCase()) ||
      !safeCompare(inputPassword, expectedPassword)
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    setAdminCookie(response, createAdminToken());
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
