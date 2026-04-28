import { NextRequest, NextResponse } from "next/server";
import {
  getGallerySettings,
  normalizeGallerySettings,
  saveGallerySettings,
} from "@/lib/gallery-settings";
import type { GallerySettings } from "@/types/gallery-settings";

function isAuthorized(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

export async function GET() {
  const settings = await getGallerySettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { settings?: Partial<GallerySettings> };
    if (!body.settings) {
      return NextResponse.json({ error: "settings مطلوبة" }, { status: 400 });
    }

    const saved = await saveGallerySettings(normalizeGallerySettings(body.settings));
    return NextResponse.json({ success: true, settings: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر حفظ إعدادات المعرض" },
      { status: 500 },
    );
  }
}
