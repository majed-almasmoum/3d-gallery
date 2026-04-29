"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  KeyRound,
  Loader2,
  Lock,
  Palette,
  Pencil,
  Plus,
  Printer,
  Save,
  Settings2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Nav } from "@/components/nav";
import type { GallerySettings, GalleryStatCardKey } from "@/types/gallery-settings";
import type { ColorMethod, Work, WorkDraft } from "@/types/work";

type UploadPreview = {
  file: File;
  base64: string;
  dataUrl: string;
  contentType: string;
};

type VerifyResult = {
  ok: boolean;
  error?: string;
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

const statCardLabels: Record<GalleryStatCardKey, string> = {
  works: "الأعمال",
  materials: "الخامات",
  colored: "الأعمال الملونة",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "حدث خطأ غير متوقع";
}

function summarizeDescription(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    return "مجسم مطبوع بعناية مع ضبط الخامة والتشطيب حسب نوع العمل.";
  }

  return normalized.length > 96 ? `${normalized.slice(0, 93)}...` : normalized;
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

function canRasterizeInBrowser(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return !["heic", "heif"].includes(extension);
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function convertHeicPreview(file: File): Promise<string> {
  const mod = await import("heic2any");
  const heic2any = mod.default as (options: {
    blob: Blob;
    toType: string;
    quality?: number;
  }) => Promise<Blob | Blob[]>;

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });

  const blob = Array.isArray(converted) ? converted[0] : converted;
  return readFileAsDataUrl(
    new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
      type: "image/jpeg",
    }),
  );
}

async function resizeImage(file: File): Promise<UploadPreview> {
  if (!canRasterizeInBrowser(file)) {
    const originalDataUrl = await readFileAsDataUrl(file);
    const previewDataUrl = await convertHeicPreview(file);
    return {
      file,
      base64: originalDataUrl.split(",")[1] || "",
      dataUrl: previewDataUrl,
      contentType: file.type || "image/heic",
    };
  }

  const sourceFile = file;

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(sourceFile);

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
              file: sourceFile,
              base64: dataUrl.split(",")[1] || "",
              dataUrl,
              contentType: "image/jpeg",
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

export function GalleryClient({
  initialWorks,
  initialSettings,
}: {
  initialWorks: Work[];
  initialSettings: GallerySettings;
}) {
  const [works, setWorks] = useState(initialWorks);
  const [settings, setSettings] = useState<GallerySettings>(initialSettings);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
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

  const visibleStatCards = [
    {
      key: "works" as const,
      value: works.length,
      description: "إجمالي العناصر المعروضة",
    },
    {
      key: "materials" as const,
      value: materials.length || 1,
      description: "أنواع مواد متاحة للفرز",
    },
    {
      key: "colored" as const,
      value: works.filter((work) => work.colorMethod !== "none").length,
      description: "تحتوي على طباعة ملونة أو تلوين يدوي",
    },
  ].filter((card) => !settings.hiddenStatCards.includes(card.key));

  useEffect(() => {
    const storedPassword = sessionStorage.getItem("adminPw") || "";
    if (!storedPassword) return;

    verifyPassword(storedPassword).then((result) => {
      if (result.ok) {
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
    document.body.style.overflow = lightbox || showAddModal || showPasswordModal || showSettingsModal
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox, showAddModal, showPasswordModal, showSettingsModal]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightbox(null);
        setShowAddModal(false);
        setShowPasswordModal(false);
        setShowSettingsModal(false);
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

  async function saveGallerySettings(nextSettings: GallerySettings) {
    try {
      const result = await jsonFetch<{ settings: GallerySettings }>("/api/gallery-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ settings: nextSettings }),
      });
      setSettings(result.settings);
      showToast("تم حفظ إعدادات واجهة المعرض", "ok");
    } catch (error) {
      showToast(getErrorMessage(error), "err");
    }
  }

  function updateGallerySettings(patch: Partial<GallerySettings>) {
    const nextSettings = {
      ...settings,
      ...patch,
    };
    setSettings(nextSettings);
    void saveGallerySettings(nextSettings);
  }

  async function verifyPassword(password: string): Promise<VerifyResult> {
    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          ok: false,
          error: data.error || "كلمة المرور غير صحيحة",
        };
      }

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: getErrorMessage(error),
      };
    }
  }

  async function submitPassword() {
    if (!passwordInput.trim()) return;

    const result = await verifyPassword(passwordInput);
    if (!result.ok) {
      showToast(result.error || "كلمة المرور غير صحيحة", "err");
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

  const isEditing = Boolean(editingWork);

  function resetForm(work?: Work) {
    setName(work?.name || "");
    setMaterial(work?.material || "PLA");
    setPrintHours(work?.printHours === "—" ? "" : work?.printHours || "");
    setDescription(work?.description || "");
    setColorMethod(work?.colorMethod || "none");
    setSelectedFiles([]);
    setProgress({ pct: 0, text: "" });
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openAddModal() {
    setEditingWork(null);
    resetForm();
    setShowAddModal(true);
  }

  function openEditModal(work: Work) {
    setEditingWork(work);
    resetForm(work);
    setShowAddModal(true);
  }

  async function handleFiles(files: FileList | File[]) {
    const image = Array.from(files).find((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      return file.type.startsWith("image/") || ["heic", "heif"].includes(extension);
    });
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
        contentType: preview.contentType,
      }),
    });
  }

  async function saveWork() {
    if (!name.trim()) {
      showToast("أدخل اسم المجسم", "err");
      return;
    }

    if (!isEditing && selectedFiles.length === 0) {
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

      const existingImages = editingWork?.images || [];
      const draft: WorkDraft = {
        name: name.trim(),
        material,
        printHours: printHours || "—",
        colorMethod,
        description: description.trim(),
        images: imagePaths.length > 0 ? imagePaths : existingImages,
      };

      setProgress({ pct: 85, text: "جاري حفظ العمل..." });
      const result = await jsonFetch<{ work: Work }>("/api/works", {
        method: editingWork ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          id: editingWork?.id,
          work: draft,
          replacedImages: editingWork && imagePaths.length > 0 ? existingImages : [],
        }),
      });

      setWorks((current) =>
        editingWork
          ? current.map((item) => (item.id === result.work.id ? result.work : item))
          : [result.work, ...current],
      );
      setProgress({ pct: 100, text: "تم بنجاح" });
      showToast(
        editingWork ? `تم تعديل "${result.work.name}"` : `تم إضافة "${result.work.name}"`,
        "ok",
      );
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
    <main className="theme-shell min-h-screen text-[var(--foreground)]">
      <Nav active="gallery" />

      <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-10 sm:pt-12 lg:pt-16">
        <div className="mb-12 max-w-4xl">
          <h1 className="font-display text-[clamp(3.2rem,10vw,5.8rem)] leading-[0.95] text-[var(--foreground)]">
            Masterpieces
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-[var(--muted)]">
            {loading
              ? "جاري تحديث الأعمال..."
              : "A curated exploration of additive manufacturing as fine art. Browse our portfolio of high-fidelity prints, spanning from intricate resin miniatures to large-scale structural prototypes."}
          </p>
        </div>

        <div className="luxury-panel rounded-[24px] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--subtle)]">Filter by</span>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-full border px-5 py-3 text-[11px] uppercase tracking-[0.18em] transition ${
                  activeFilter === "all"
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold-strong)]"
                    : "border-white/10 text-white/55 hover:border-[color:var(--gold)]/35 hover:text-white"
                }`}
              >
                All Projects
              </button>
              {materials.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveFilter(item)}
                  className={`rounded-full border px-5 py-3 text-[11px] uppercase tracking-[0.18em] transition ${
                    activeFilter === item
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold-strong)]"
                      : "border-white/10 text-white/55 hover:border-[color:var(--gold)]/35 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {adminMode ? (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-strong))] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black shadow-[0_0_20px_rgba(212,175,55,0.18)] transition hover:opacity-90"
              >
                <Plus size={16} />
                Add Project
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex justify-end">

          {visibleStatCards.length ? (
            <div className={`grid gap-4 sm:grid-cols-3 xl:grid-cols-1 ${settings.statsCompact ? "xl:max-w-[240px]" : ""}`}>
              {visibleStatCards.map((card) => (
                <div
                  key={card.key}
                  className={`luxury-panel rounded-[24px] ${settings.statsCompact ? "p-4" : "p-5"}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--subtle)]">
                    {statCardLabels[card.key]}
                  </p>
                  <div className={`font-display text-[color:var(--gold)] ${settings.statsCompact ? "mt-2 text-3xl" : "mt-3 text-4xl"}`}>
                    {card.value}
                  </div>
                  <p className={`text-[var(--muted)] ${settings.statsCompact ? "mt-1 text-xs leading-6" : "mt-1 text-sm"}`}>
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 pb-24 md:grid-cols-12">
        {filteredWorks.length ? (
          filteredWorks.map((work, index) => (
            <article
              key={work.id}
              className={`animate-fade-up luxury-panel group relative overflow-hidden rounded-[24px] transition duration-700 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(212,175,55,0.08)] ${
                index === 0 ? "md:col-span-8 md:min-h-[560px]" : index === 1 ? "md:col-span-4 md:min-h-[560px]" : "md:col-span-6 md:min-h-[420px]"
              }`}
              style={{ animationDelay: `${Math.min(index * 25, 250)}ms` }}
            >
              <button
                type="button"
                className={`relative block w-full overflow-hidden bg-black/30 text-right ${
                  index === 0 ? "h-[560px]" : index === 1 ? "h-[560px]" : "h-[420px]"
                }`}
                onClick={() => work.images[0] && setLightbox({ work, index: 0 })}
              >
                {work.images[0] ? (
                  <img
                    src={work.images[0]}
                    alt={work.name}
                    className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20">
                    <Printer size={48} />
                  </div>
                )}
                {work.images.length > 1 ? (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-[color:var(--gold)]/25 bg-black/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--gold-strong)]">
                    <Images size={13} />
                    {work.images.length}
                  </span>
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />
                {adminMode ? (
                  <span className="absolute right-3 top-3 flex gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                    <span
                      role="button"
                      tabIndex={0}
                      title="تعديل"
                      aria-label="تعديل"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditModal(work);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.stopPropagation();
                          openEditModal(work);
                        }
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition hover:border-[color:var(--gold)]/50 hover:text-[color:var(--gold)]"
                    >
                      <Pencil size={15} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      title="حذف"
                      aria-label="حذف"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteWork(work);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.stopPropagation();
                          deleteWork(work);
                        }
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-300/20 bg-red-600/90 text-white backdrop-blur transition hover:bg-red-500"
                    >
                      <Trash2 size={15} />
                    </span>
                  </span>
                ) : null}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-8">
                  <div className="mb-4 flex flex-wrap gap-2 opacity-0 transition duration-500 group-hover:opacity-100">
                    <Tag className="border-[color:var(--gold)]/25 bg-black/70 text-[color:var(--gold-strong)]">
                      {work.material}
                    </Tag>
                    {work.printHours !== "—" ? (
                      <Tag className="border-[color:var(--gold)]/25 bg-black/70 text-[color:var(--gold-strong)]">
                        <Clock3 className="ml-1 inline h-3 w-3" />
                        {work.printHours}h
                      </Tag>
                    ) : null}
                    <Tag className="border-[color:var(--gold)]/25 bg-black/70 text-[color:var(--gold-strong)]">
                      <Palette className="ml-1 inline h-3 w-3" />
                      {colorLabels[work.colorMethod]}
                    </Tag>
                  </div>
                  <h2 className={`font-display text-[var(--foreground)] drop-shadow-xl ${index === 0 ? "text-5xl" : "text-3xl"}`}>
                    {work.name}
                  </h2>
                  <p className={`mt-4 max-w-2xl text-[var(--muted)] ${index === 0 ? "text-lg leading-8" : "text-base leading-7"}`}>
                    {summarizeDescription(work.description)}
                  </p>
                </div>
              </button>
            </article>
          ))
        ) : (
          <div className="col-span-full rounded-[28px] border border-dashed border-white/10 bg-[rgba(17,16,14,0.82)] py-24 text-center text-[var(--subtle)]">
            <Printer className="mx-auto mb-4 h-12 w-12" />
            <p>لا توجد أعمال بعد</p>
            {adminMode ? (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--gold)]/45 bg-[color:var(--gold)]/10 px-5 text-sm font-bold text-[color:var(--gold)] transition hover:bg-[color:var(--gold)]/15"
              >
                <Plus size={17} />
                إضافة عمل
              </button>
            ) : null}
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 px-5 py-7 text-center text-xs uppercase tracking-[0.18em] text-[var(--subtle)]">
        © 2026 Majed Almasmoum · 3D Gallery
      </footer>

      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {adminMode ? (
          <button
            type="button"
            title="إعدادات المعرض"
            aria-label="إعدادات المعرض"
            onClick={() => setShowSettingsModal(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#1d1d29] text-white/70 shadow-xl shadow-black/35 transition hover:scale-105 hover:bg-white/10"
          >
            <Settings2 size={18} />
          </button>
        ) : null}
        {adminMode ? (
          <button
            type="button"
            title="إضافة عمل"
            aria-label="إضافة عمل"
            onClick={openAddModal}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-strong))] px-4 text-sm font-bold text-black shadow-xl shadow-black/35 transition hover:scale-105 sm:h-14 sm:px-5"
          >
            <Plus size={20} />
            <span>إضافة عمل</span>
          </button>
        ) : null}
        <button
          type="button"
          title={adminMode ? "إيقاف وضع الإدارة" : "وضع الإدارة"}
          aria-label={adminMode ? "إيقاف وضع الإدارة" : "وضع الإدارة"}
          onClick={toggleAdmin}
          className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-xl shadow-black/35 transition hover:scale-105 ${
            adminMode
              ? "border-[color:var(--gold)]/45 bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
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

      {showSettingsModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSettingsModal(false);
          }}
        >
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#15151b] p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">واجهة المعرض</h2>
                <p className="mt-1 text-sm text-white/45">تحكم في الكروت العلوية: تصغير أو إخفاء.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white">وضع الكروت المضغوط</h3>
                    <p className="mt-1 text-xs text-white/45">يصغر ارتفاع ومحتوى الكروت العلوية.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateGallerySettings({ statsCompact: !settings.statsCompact })}
                    className={`relative h-8 w-14 rounded-full transition ${
                      settings.statsCompact ? "bg-[#f5c97a]" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-[#121217] transition ${
                        settings.statsCompact ? "right-1" : "right-7"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="mb-3 text-sm font-black text-white">إخفاء أو إظهار الكروت</h3>
                <div className="space-y-2">
                  {(["works", "materials", "colored"] as GalleryStatCardKey[]).map((key) => {
                    const hidden = settings.hiddenStatCards.includes(key);
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                      >
                        <span className="text-sm font-bold text-white">{statCardLabels[key]}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const hiddenStatCards = hidden
                              ? settings.hiddenStatCards.filter((item) => item !== key)
                              : [...settings.hiddenStatCards, key];
                            updateGallerySettings({ hiddenStatCards });
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                        >
                          {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
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
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-[#15151b] p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-black text-white">
                {isEditing ? "تعديل العمل" : "إضافة عمل جديد"}
              </h2>
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
              className="mb-4 rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center transition hover:border-[#fb923c]/50 hover:bg-[#fb923c]/5"
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
              <p className="font-bold text-white/75">
                {isEditing ? "ارفع صورة بديلة أو اترك الصورة الحالية" : "اسحب صورة واحدة هنا أو انقر للرفع"}
              </p>
              <p className="mt-1 text-xs text-white/35">
                {isEditing ? "رفع صورة جديدة يستبدل الصورة الحالية" : "كل عمل ينحفظ كإضافة فردية"}
              </p>
              <p className="mt-1 text-[11px] text-white/30">
                يدعم JPG و PNG و WEBP و HEIC و HEIF وغيرها من صيغ الصور الشائعة.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.webp,.avif"
                hidden
                onChange={(event) => {
                  if (event.target.files) handleFiles(event.target.files);
                }}
              />
            </div>

            {selectedFiles.length || editingWork?.images[0] ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {selectedFiles.length === 0 && editingWork?.images[0] ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#fb923c]/30">
                    <img
                      src={editingWork.images[0]}
                      alt={editingWork.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white/80">
                      الحالية
                    </span>
                  </div>
                ) : null}
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
                ) : isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {isEditing ? "حفظ التعديل" : "حفظ العمل"}
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
            {adminMode ? (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openEditModal(lightbox.work);
                    setLightbox(null);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 text-sm font-bold text-white transition hover:border-[#fb923c]/40 hover:text-[#fb923c]"
                >
                  <Pencil size={15} />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteWork(lightbox.work);
                    setLightbox(null);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-300/20 bg-red-600/90 px-4 text-sm font-bold text-white transition hover:bg-red-500"
                >
                  <Trash2 size={15} />
                  حذف
                </button>
              </div>
            ) : null}
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
