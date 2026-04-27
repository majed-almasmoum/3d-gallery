import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  SITE_CONTENT_KEY,
  defaultSiteContent,
  getSiteContent,
  mergeContent,
} from "@/lib/site-content";
import type { SiteContent } from "@/types/site-content";

function isAuthorized(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "أضف SUPABASE_SERVICE_ROLE_KEY في .env.local لتفعيل التعديل" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { content?: Partial<SiteContent> };
  if (!body.content) {
    return NextResponse.json({ error: "content مطلوب" }, { status: 400 });
  }

  const merged = mergeContent({ ...defaultSiteContent, ...body.content });

  const { error } = await supabase
    .from("site_content")
    .upsert(
      { key: SITE_CONTENT_KEY, data: merged, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, content: merged });
}
