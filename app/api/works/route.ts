import { NextRequest, NextResponse } from "next/server";
import { getLocalWorks } from "@/lib/works";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { worksBucket, worksTable } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ColorMethod, Work, WorkDraft } from "@/types/work";

type DatabaseWork = {
  id: number | string;
  name: string | null;
  material: string | null;
  print_hours: string | null;
  color_method: ColorMethod | null;
  description: string | null;
  image_paths: string[] | null;
  created_at: string | null;
};

function isAuthorized(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

function fromDatabase(row: DatabaseWork): Work {
  return {
    id: row.id,
    name: row.name || "عمل مطبوع",
    material: row.material || "PLA",
    printHours: row.print_hours || "—",
    colorMethod: row.color_method || "none",
    description: row.description || "",
    images: row.image_paths || [],
    addedAt: row.created_at || "",
  };
}

function storagePathFromPublicUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${worksBucket}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

async function removeStorageImages(imageUrls: string[]) {
  const supabase = createAdminSupabaseClient();
  const storagePaths = imageUrls
    .map(storagePathFromPublicUrl)
    .filter((item): item is string => Boolean(item));

  if (!supabase || storagePaths.length === 0) return;

  await supabase.storage.from(worksBucket).remove(storagePaths);
}

export async function GET() {
  const supabase = createServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from(worksTable)
      .select("id,name,material,print_hours,color_method,description,image_paths,created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json(data.map((row) => fromDatabase(row as DatabaseWork)));
    }
  }

  return NextResponse.json(await getLocalWorks());
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "أضف SUPABASE_SERVICE_ROLE_KEY في .env.local لتفعيل الحفظ" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { work?: WorkDraft };
  if (!body.work?.name) {
    return NextResponse.json({ error: "work مطلوب" }, { status: 400 });
  }

  const work = body.work;
  const { data, error } = await supabase
    .from(worksTable)
    .insert({
      name: work.name,
      material: work.material,
      print_hours: work.printHours || "—",
      color_method: work.colorMethod,
      description: work.description,
      image_paths: work.images,
    })
    .select("id,name,material,print_hours,color_method,description,image_paths,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, work: fromDatabase(data as DatabaseWork) });
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

  const body = (await request.json()) as {
    id?: string | number;
    work?: WorkDraft;
    replacedImages?: string[];
  };

  if (!body.id || !body.work?.name) {
    return NextResponse.json({ error: "id و work مطلوبان" }, { status: 400 });
  }

  const work = body.work;
  const { data, error } = await supabase
    .from(worksTable)
    .update({
      name: work.name,
      material: work.material,
      print_hours: work.printHours || "—",
      color_method: work.colorMethod,
      description: work.description,
      image_paths: work.images,
    })
    .eq("id", body.id)
    .select("id,name,material,print_hours,color_method,description,image_paths,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.replacedImages?.length) {
    await removeStorageImages(body.replacedImages);
  }

  return NextResponse.json({ success: true, work: fromDatabase(data as DatabaseWork) });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "أضف SUPABASE_SERVICE_ROLE_KEY في .env.local لتفعيل الحذف" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { id?: string | number };
  if (!body.id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from(worksTable)
    .select("image_paths")
    .eq("id", body.id)
    .single();

  const { error } = await supabase.from(worksTable).delete().eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const oldImages = (existing as Pick<DatabaseWork, "image_paths"> | null)?.image_paths || [];
  await removeStorageImages(oldImages);

  return NextResponse.json({ success: true });
}
