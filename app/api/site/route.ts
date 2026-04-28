import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { worksBucket } from "@/lib/supabase/config";
import { getSiteContent, normalizeSiteContent, siteContentPath } from "@/lib/site";
import type { SiteContent } from "@/types/site";

function normalizePassword(value: string | null | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

function isAuthorized(request: NextRequest) {
  return normalizePassword(request.headers.get("x-admin-password")) ===
    normalizePassword(process.env.ADMIN_PASSWORD);
}

export async function GET() {
  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY غير موجود" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { content?: Partial<SiteContent> };
  const content = normalizeSiteContent(body.content || {});

  const { error } = await supabase.storage
    .from(worksBucket)
    .upload(siteContentPath, JSON.stringify(content, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, content });
}
