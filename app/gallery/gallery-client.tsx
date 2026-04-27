"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImagePlus,
  Images,
  KeyRound,
  Loader2,
  Lock,
  Palette,
  Plus,
  Printer,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Nav } from "@/components/nav";
import type { ColorMethod, Work, WorkDraft } from "@/types/work";

type UploadPreview = {
  file: File;
  base64: string;
  dataUrl: string;
};

const colorLabels: Record<ColorMethod, string> = {
  none: "بدون تلوين",
  printed: "طُبع ملون",
  painted: "لُوّن يدوياً",
};

const colorClasses: Record<ColorMethod, string> = {
  none: "border-white/10 bg-white/5 text-white/45",
  printed: "border-emerald-300/25 bg-emerald-300/10 text-emerald-300",
  painted: "border-violet-300/25 bg-violet-300/10 text-violet-300",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "حدث خطأ غير متوقع";
}

function Tag({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`rounded border px-2 py-1 text-[11px] font-bold ${className}`}>
      {children}
    </span>
  );
}

async function resizeImage(file: File): Promise<UploadPreview> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const maxSize = 1280;
      let { width, height } = image;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("تعذر تجهيز الصورة"));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = String(reader.result);
            resolve({
              file,
              base64: dataUrl.split(",")[1] || "",
              dataUrl,
            });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.82,
      );
    };

    image.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    image.src = objectUrl;
  });
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data as T;
}

export function GalleryClient({ initialWorks }: { initialWorks: Work[] }) {
  const [works, setWorks] = useState(initialWorks);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadPreview[]>([]);
  const [colorMethod, setColorMethod] = useState<ColorMethod>("none");
  const [material, setMaterial] = useState("PLA");
  const [name, setName] = useState("");
  const [printHours, setPrintHours] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState({ pct: 0, text: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "ok" | "err";
  } | null>(null);
  const [lightbox, setLightbox] = useState<{ work: Work; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const materials = useMemo(() => {
    return Array.from(new Set(works.map((work) => work.material).filter(Boolean)));
  }, [works]);

  const filteredWorks =
    activeFilter === "all"
      ? works
      : works.filter((work) => work.material === activeFilter);

  useEffect(() => {
    const storedPassword = sessionStorage.getItem("adminPw") || "";
    if (!storedPassword) return;

    verifyPassword(storedPassword).then((ok) => {
      if (ok) {
        setAdminPassword(storedPassword);
        setAdminMode(true);
      } else {
        sessionStorage.removeItem("adminPw");
      }
    });
  }, []);

  useEffect(() => {
    fetch("/api/works")
      .then((response) => response.json())
      .then((data: Work[]) => setWorks(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = lightbox || showAddModal || showPasswordModal
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox, showAddModal, showPasswordModal]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightbox(null);
        setShowAddModal(false);
        setShowPasswordModal(false);
      }

      if (lightbox && event.key === "ArrowLeft") navigateLightbox(1);
      if (lightbox && event.key === "ArrowRight") navigateLightbox(-1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function showToast(message: string, type: "ok" | "err" = "ok") {
    setToast({ message, type });
  }

  async function verifyPassword(password: string) {
    try {
      await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
      }).then((response) => {
        if (!response.ok) throw new Error("bad password");
      });
      return true;
    } catch {
      return false;
    }
  }

  async function submitPassword() {
    if (!passwordInput.trim()) return;

    const ok = await verifyPassword(passwordInput.trim());
    if (!ok) {
      showToast("كلمة المرور غير صحيحة", "err");
      return;
    }

    setAdminPassword(passwordInput.trim());
    sessionStorage.setItem("adminPw", passwordInput.trim());
    setPasswordInput("");
    setShowPasswordModal(false);
    setAdminMode(true);
  }

  function toggleAdmin() {
    if (adminMode) {
      setAdminMode(false);
      setAdminPassword("");
      sessionStorage.removeItem("adminPw");
      return;
    }

    setShowPasswordModal(true);
  }

  function resetForm() {
    setName("");
    setMaterial("PLA");
    setPrintHours("");
    setDescription("");
    setColorMethod("none");
    setSelectedFiles([]);
    setProgress({ pct: 0, text: "" });
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  async function handleFiles(files: FileList | File[]) {
    const image = Array.from(files).find((file) => file.type.startsWith("image/"));
    if (!image) return;

    const prepared = await resizeImage(image);
    setSelectedFiles([prepared]);
  }

  async function uploadImage(preview: UploadPreview) {
    return jsonFetch<{ path: string }>("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify({
        filename: preview.file.name,
        content: preview.base64,
        contentType: "image/jpeg",
      }),
    });
  }

  async function saveWork() {
    if (!name.trim()) {
      showToast("أدخل اسم المجسم", "err");
      return;
    }

    if (selectedFiles.length === 0) {
      showToast("اختر صورة للعمل", "err");
      return;
    }

    setSaving(true);
    setProgress({ pct: 5, text: "جاري البدء..." });

    try {
      const imagePaths: string[] = [];
      const total = selectedFiles.length + 1;

      for (const [index, file] of selectedFiles.entries()) {
        setProgress({
          pct: Math.round((index / total) * 100),
          text: `رفع صورة ${index + 1} من ${selectedFiles.length}...`,
        });
        const uploaded = await uploadImage(file);
        imagePaths.push(uploaded.path);
      }

      const draft: WorkDraft = {
        name: name.trim(),
        material,
        printHours: printHours || "—",
        colorMethod,
        description: description.trim(),
        images: imagePaths,
      };

      setProgress({ pct: 85, text: "جاري حفظ العمل..." });
      const result = await jsonFetch<{ work: Work }>("/api/works", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ work: draft }),
      });

      setWorks((current) => [result.work, ...current]);
      setProgress({ pct: 100, text: "تم بنجاح" });
      showToast(`تم إضافة "${result.work.name}"`, "ok");
      window.setTimeout(() => setShowAddModal(false), 800);
    } catch (error) {
      showToast(getErrorMessage(error), "err");
    } finally {
      setSaving(false);
    }
  }

  async function deleteWork(work: Work) {
    const confirmed = window.confirm(`حذف "${work.name}"؟`);
    if (!confirmed) return;

    try {
      await jsonFetch<{ success: true }>("/api/works", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ id: work.id }),
      });

      setWorks((current) => current.filter((item) => item.id !== work.id));
      showToast("تم الحذف", "ok");
    } catch (error) {
      showToast(getErrorMessage(error), "err");
    }
  }

  function navigateLightbox(direction: number) {
    setLightbox((current) => {
      if (!current) return null;
      const length = current.work.images.length;
      if (!length) return current;
      return {
        ...current,
        index: (current.index + direction + length) % length,
      };
    });
  }

  return (
    <main className="min-h-screen bg-[#0f0f13] text-[#f0ece4]">
      <Nav active="gallery" adminMode={adminMode} />

      <header className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">معرض الأعمال</h1>
          <p className="mt-2 text-sm text-white/45">
            {loading ? "جاري التحديث..." : `${works.length} عمل مطبوع`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`h-9 rounded-full border px-4 text-sm transition ${
                activeFilter === "all"
                  ? "border-[#fb923c]/55 bg-[#fb923c]/10 text-[#fb923c]"
                  : "border-white/10 text-white/45 hover:border-white/25 hover:text-white"
              }`}
            >
              الكل ({works.length})
            </button>
            {materials.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveFilter(item)}
                className={`h-9 rounded-full border px-4 text-sm transition ${
                  activeFilter === item
                    ? "border-[#fb923c]/55 bg-[#fb923c]/10 text-[#fb923c]"
                    : "border-white/10 text-white/45 hover:border-white/25 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {adminMode ? (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-4 text-sm font-bold text-black transition hover:opacity-90"
              >
                <Plus size={17} />
                إضافة عمل
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleAdmin}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                adminMode
                  ? "border-[#fb923c]/45 bg-[#fb923c]/10 text-[#fb923c]"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Lock size={16} />
              {adminMode ? "خروج الإدارة" : "دخول الإدارة"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 px-5 pb-24">
        {filteredWorks.length ? (
          filteredWorks.map((work, index) => (
            <article
              key={work.id}
              className="animate-fade-up overflow-hidden rounded-lg border border-white/10 bg-[#191923] transition hover:-translate-y-1 hover:border-[#fb923c]/35 hover:shadow-2xl hover:shadow-black/30"
              style={{ animationDelay: `${Math.min(index * 25, 250)}ms` }}
            >
              <button
                type="button"
                className="group relative block h-56 w-full overflow-hidden bg-black/30 text-right"
                onClick={() => work.images[0] && setLightbox({ work, index: 0 })}
              >
                {work.images[0] ? (
                  <img
                    src={work.images[0]}
                    alt={work.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20">
                    <Printer size={48} />
                  </div>
                )}
                {work.images.length > 1 ? (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                    <Images size={13} />
                    {work.images.length}
                  </span>
                ) : null}
              </button>

              {adminMode ? (
                <button
                  type="button"
                  title="حذف"
                  aria-label="حذف"
                  onClick={() => deleteWork(work)}
                  className="-mt-14 mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
                >
                  <Trash2 size={16} />
                </button>
              ) : null}

              <div className="p-4">
                <h2 className="truncate text-base font-bold text-white">{work.name}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag className="border-[#fb923c]/25 bg-[#fb923c]/10 text-[#fb923c]">
                    {work.material}
                  </Tag>
                  {work.printHours !== "—" ? (
                    <Tag className="border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
                      <Clock3 className="ml-1 inline h-3 w-3" />
                      {work.printHours}h
                    </Tag>
                  ) : null}
                  <Tag className={colorClasses[work.colorMethod]}>
                    <Palette className="ml-1 inline h-3 w-3" />
                    {colorLabels[work.colorMethod]}
                  </Tag>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-24 text-center text-white/35">
            <Printer className="mx-auto mb-4 h-12 w-12" />
            <p>لا توجد أعمال بعد</p>
            <button
              type="button"
              onClick={adminMode ? openAddModal : toggleAdmin}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-[#fb923c]/45 bg-[#fb923c]/10 px-5 text-sm font-bold text-[#fb923c] transition hover:bg-[#fb923c]/15"
            >
              {adminMode ? <Plus size={17} /> : <Lock size={17} />}
              {adminMode ? "إضافة عمل" : "دخول الإدارة"}
            </button>
          </div>
        )}
      </section>

      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {adminMode ? (
          <button
            type="button"
            title="إضافة عمل"
            aria-label="إضافة عمل"
            onClick={openAddModal}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-l from-[#fb923c] to-[#f59e0b] text-black shadow-xl shadow-black/35 transition hover:scale-105"
          >
            <Plus size={26} />
          </button>
        ) : null}
        <button
          type="button"
          title={adminMode ? "إيقاف وضع الإدارة" : "وضع الإدارة"}
          aria-label={adminMode ? "إيقاف وضع الإدارة" : "وضع الإدارة"}
          onClick={toggleAdmin}
          className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-xl shadow-black/35 transition hover:scale-105 ${
            adminMode
              ? "border-[#fb923c]/50 bg-[#fb923c]/10 text-[#fb923c]"
              : "border-white/10 bg-[#1d1d29] text-white/60"
          }`}
        >
          <Lock size={20} />
        </button>
      </div>

      {showPasswordModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowPasswordModal(false);
          }}
        >
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#161620] p-6">
            <KeyRound className="mb-4 h-8 w-8 text-[#fb923c]" />
            <h2 className="text-xl font-black text-white">وضع الإدارة</h2>
            <p className="mt-2 text-sm text-white/45">أدخل كلمة المرور للتعديل</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitPassword();
              }}
              className="mt-5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-[#fb923c]/50 focus:ring-4 focus:ring-[#fb923c]/10"
              placeholder="كلمة المرور"
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="h-10 rounded-lg border border-white/10 px-5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={submitPassword}
                className="h-10 rounded-lg bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-5 text-sm font-bold text-black transition hover:opacity-90"
              >
                دخول
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAddModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-[#161620] p-6">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-black text-white">إضافة عمل جديد</h2>
              <button
                type="button"
                title="إغلاق"
                aria-label="إغلاق"
                onClick={() => setShowAddModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="mb-4 rounded-lg border-2 border-dashed border-white/10 p-8 text-center transition hover:border-[#fb923c]/50 hover:bg-[#fb923c]/5"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFiles(event.dataTransfer.files);
              }}
              role="button"
              tabIndex={0}
            >
              <Upload className="mx-auto mb-3 h-9 w-9 text-[#fb923c]" />
              <p className="font-bold text-white/75">اسحب صورة واحدة هنا أو انقر للرفع</p>
              <p className="mt-1 text-xs text-white/35">كل عمل ينحفظ كإضافة فردية</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  if (event.target.files) handleFiles(event.target.files);
                }}
              />
            </div>

            {selectedFiles.length ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={file.dataUrl}
                    className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10"
                  >
                    <img src={file.dataUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      title="إزالة الصورة"
                      aria-label="إزالة الصورة"
                      onClick={() =>
                        setSelectedFiles((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/40">
                  اسم المجسم *
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-[#fb923c]/50 focus:ring-4 focus:ring-[#fb923c]/10"
                  placeholder="مثال: Dragon Skull"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/40">
                  المادة المطبوعة
                </span>
                <select
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#21212d] px-4 text-white outline-none transition focus:border-[#fb923c]/50 focus:ring-4 focus:ring-[#fb923c]/10"
                >
                  {["PLA", "PETG", "ABS", "ASA", "TPU", "Resin", "Nylon", "أخرى"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/40">
                  مدة الطباعة (ساعات)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={printHours}
                  onChange={(event) => setPrintHours(event.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-[#fb923c]/50 focus:ring-4 focus:ring-[#fb923c]/10"
                  placeholder="6.5"
                />
              </label>

              <div>
                <span className="mb-2 block text-xs font-bold text-white/40">
                  طريقة التلوين
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["none", "printed", "painted"] as ColorMethod[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setColorMethod(item)}
                      className={`h-11 rounded-lg border px-3 text-sm transition ${
                        colorMethod === item
                          ? "border-[#fb923c]/55 bg-[#fb923c]/10 text-[#fb923c]"
                          : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      {colorLabels[item]}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-white/40">
                  وصف (اختياري)
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#fb923c]/50 focus:ring-4 focus:ring-[#fb923c]/10"
                  placeholder="تفاصيل إضافية عن المجسم..."
                />
              </label>
            </div>

            {progress.text ? (
              <div className="mt-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#fb923c] to-[#f59e0b] transition-all"
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/45">{progress.text}</p>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-11 rounded-lg border border-white/10 px-5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveWork}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-5 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                حفظ العمل
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightbox(null);
          }}
        >
          <button
            type="button"
            title="إغلاق"
            aria-label="إغلاق"
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {lightbox.work.images.length > 1 ? (
            <>
              <button
                type="button"
                title="الصورة السابقة"
                aria-label="الصورة السابقة"
                onClick={() => navigateLightbox(-1)}
                className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
              <button
                type="button"
                title="الصورة التالية"
                aria-label="الصورة التالية"
                onClick={() => navigateLightbox(1)}
                className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
            </>
          ) : null}

          <div className="w-full max-w-4xl px-14 text-center">
            <img
              src={lightbox.work.images[lightbox.index]}
              alt={lightbox.work.name}
              className="mx-auto max-h-[72vh] max-w-full rounded-lg object-contain"
            />
            <h2 className="mt-5 text-xl font-black text-white">{lightbox.work.name}</h2>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Tag className="border-[#fb923c]/25 bg-[#fb923c]/10 text-[#fb923c]">
                {lightbox.work.material}
              </Tag>
              {lightbox.work.printHours !== "—" ? (
                <Tag className="border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
                  {lightbox.work.printHours}h
                </Tag>
              ) : null}
              <Tag className={colorClasses[lightbox.work.colorMethod]}>
                {colorLabels[lightbox.work.colorMethod]}
              </Tag>
            </div>
            {lightbox.work.images.length > 1 ? (
              <p className="mt-4 text-xs text-white/40">
                {lightbox.index + 1} / {lightbox.work.images.length}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`fixed bottom-6 right-1/2 z-[70] translate-x-1/2 rounded-lg border bg-[#1e1e2e] px-5 py-3 text-sm shadow-xl shadow-black/40 ${
            toast.type === "ok"
              ? "border-emerald-300/35 text-emerald-300"
              : "border-red-300/35 text-red-300"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </main>
  );
}
