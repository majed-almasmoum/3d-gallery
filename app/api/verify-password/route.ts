import { NextRequest, NextResponse } from "next/server";

function normalizePassword(value: string | null | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

export async function POST(request: NextRequest) {
  const password = normalizePassword(request.headers.get("x-admin-password"));
  const adminPassword = normalizePassword(process.env.ADMIN_PASSWORD);

  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD غير موجود في إعدادات Vercel" },
      { status: 500 },
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json(
      { ok: false, error: "كلمة المرور غير صحيحة" },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
