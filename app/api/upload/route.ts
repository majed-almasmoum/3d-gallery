import { NextRequest, NextResponse } from "next/server";
import convert from "heic-convert";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { worksBucket, worksStoragePrefix } from "@/lib/supabase/config";

function isAuthorized(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isHeicFile(filename: string, contentType?: string) {
  const lower = filename.toLowerCase();
  const type = (contentType || "").toLowerCase();
  return (
    lower.endsWith(".heic") ||
    lower.endsWith(".heif") ||
    type.includes("heic") ||
    type.includes("heif")
  );
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
    let buffer = Buffer.from(base64, "base64");
    let filename = `${Date.now()}-${safeFilename(body.filename)}`;
    let contentType = body.contentType || "image/jpeg";

    if (isHeicFile(body.filename, body.contentType)) {
      const converted = await convert({
        buffer,
        format: "JPEG",
        quality: 0.9,
      });
      buffer = Buffer.from(converted);
      filename = filename.replace(/\.(heic|heif)$/i, ".jpg");
      contentType = "image/jpeg";
    }

    const storagePath = worksStoragePrefix
      ? `${worksStoragePrefix.replace(/^\/+|\/+$/g, "")}/${filename}`
      : filename;

    const { error } = await supabase.storage
      .from(worksBucket)
      .upload(storagePath, buffer, {
        contentType,
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
