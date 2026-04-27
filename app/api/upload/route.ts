import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { worksBucket, worksStoragePrefix } from "@/lib/supabase/config";

function isAuthorized(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "أضف SUPABASE_SERVICE_ROLE_KEY في .env.local لتفعيل الرفع" },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      filename?: string;
      content?: string;
      contentType?: string;
    };

    if (!body.filename || !body.content) {
      return NextResponse.json(
        { error: "filename و content مطلوبان" },
        { status: 400 },
      );
    }

    const base64 = body.content.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const filename = `${Date.now()}-${safeFilename(body.filename)}`;
    const storagePath = worksStoragePrefix
      ? `${worksStoragePrefix.replace(/^\/+|\/+$/g, "")}/${filename}`
      : filename;

    const { error } = await supabase.storage
      .from(worksBucket)
      .upload(storagePath, buffer, {
        contentType: body.contentType || "image/jpeg",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(worksBucket).getPublicUrl(storagePath);

    return NextResponse.json({
      path: data.publicUrl,
      storagePath,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
