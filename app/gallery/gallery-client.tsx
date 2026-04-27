"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImagePlus,
  Images,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { useAdmin } from "@/components/admin-context";
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
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
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
  const { adminMode, adminPassword } = useAdmin();
  const [works, setWorks] = useState(initialWorks);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
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
  const [confirmDelete, setConfirmDelete] = useState<Work | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const materials = useMemo(() => {
    return Array.from(new Set(works.map((work) => work.material).filter(Boolean)));
  }, [works]);

  const filteredWorks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return works
      .filter((work) => activeFilter === "all" || work.material === activeFilter)
      .filter((work) => {
        if (!term) return true;
        return (
          work.name.toLowerCase().includes(term) ||
          work.description.toLowerCase().includes(term)
        );
      });
  }, [works, activeFilter, searchTerm]);

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
    document.body.style.overflow =
      lightbox || showAddModal || confirmDelete ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox, showAddModal, confirmDelete]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightbox(null);
        setShowAddModal(false);
        setConfirmDelete(null);
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
    } finally {
      setConfirmDelete(null);
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
    <main className="relative min-h-screen overflow-hidden bg-[#08080c] text-[#f0ece4]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.13),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
      />

      <Nav active="gallery" />

      <header className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#fb923c] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fb923c]" />
              3D Gallery
            </p>
            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              معرض الأعمال
            </h1>
            <p className="mt-2 text-sm leading-7 text-white/50">
              {loading ? "جاري التحديث..." : `${works.length} عمل مطبوع`}
            </p>
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35"
              size={16}
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث عن عمل..."
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pe-10 ps-4 text-sm text-white outline-none backdrop-blur transition focus:border-[#fb923c]/40 focus:ring-4 focus:ring-[#fb923c]/15 sm:w-64"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`h-9 rounded-full border px-4 text-xs font-bold transition sm:text-sm ${
              activeFilter === "all"
                ? "border-[#fb923c]/55 bg-[#fb923c]/10 text-[#fb923c]"
                : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white"
            }`}
          >
            الكل ({works.length})
          </button>
          {materials.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveFilter(item)}
              className={`h-9 rounded-full border px-4 text-xs font-bold transition sm:text-sm ${
                activeFilter === item
                  ? "border-[#fb923c]/55 bg-[#fb923c]/10 text-[#fb923c]"
                  : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-28 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
        {filteredWorks.length ? (
          filteredWorks.map((work, index) => (
            <article
              key={work.id}
              className="group animate-fade-up overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#15151d] to-[#0e0e14] shadow-xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-[#fb923c]/40 hover:shadow-2xl hover:shadow-black/40"
              style={{ animationDelay: `${Math.min(index * 25, 250)}ms` }}
            >
              <button
                type="button"
                className="relative block aspect-[4/3] w-full overflow-hidden bg-black/40 text-right"
                onClick={() => work.images[0] && setLightbox({ work, index: 0 })}
              >
                {work.images[0] ? (
                  <img
                    src={work.images[0]}
                    alt={work.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20">
                    <Printer size={48} />
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent"
                />
                {work.images.length > 1 ? (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    <Images size={13} />
                    {work.images.length}
                  </span>
                ) : null}
                {adminMode ? (
                  <span className="absolute right-3 top-3 flex gap-2">
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
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white shadow-lg shadow-black/30 backdrop-blur transition hover:border-[#fb923c]/60 hover:bg-[#fb923c]/20 hover:text-[#fb923c]"
                    >
                      <Pencil size={14} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      title="حذف"
                      aria-label="حذف"
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfirmDelete(work);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.stopPropagation();
                          setConfirmDelete(work);
                        }
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-300/30 bg-red-600/85 text-white shadow-lg shadow-black/30 backdrop-blur transition hover:bg-red-500"
                    >
                      <Trash2 size={14} />
                    </span>
                  </span>
                ) : null}
              </button>

              <div className="p-4">
                <h2 className="truncate text-base font-bold text-white">{work.name}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag className="border-[#fb923c]/30 bg-[#fb923c]/10 text-[#fb923c]">
                    {work.material}
                  </Tag>
                  {work.printHours !== "—" ? (
                    <Tag className="border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
                      <Clock3 size={11} />
                      {work.printHours}h
                    </Tag>
                  ) : null}
                  <Tag className={colorClasses[work.colorMethod]}>
                    <Palette size={11} />
                    {colorLabels[work.colorMethod]}
                  </Tag>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-white/35 sm:py-24">
            <Printer className="mx-auto mb-4 h-12 w-12" />
            <p>لا توجد أعمال بعد</p>
            {adminMode ? (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl border border-[#fb923c]/45 bg-[#fb923c]/10 px-5 text-sm font-bold text-[#fb923c] transition hover:bg-[#fb923c]/15"
              >
                <Plus size={17} />
                إضافة عمل
              </button>
            ) : null}
          </div>
        )}
      </section>

      {adminMode ? (
        <button
          type="button"
          title="إضافة عمل"
          aria-label="إضافة عمل"
          onClick={openAddModal}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fb923c] to-[#f59e0b] text-black shadow-2xl shadow-[#fb923c]/25 transition hover:scale-105 sm:h-16 sm:w-16"
        >
          <Plus size={26} />
        </button>
      ) : null}

      {showAddModal ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#13131b] p-5 shadow-2xl shadow-black/60 sm:rounded-3xl sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-black text-white sm:text-xl">
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
              className="mb-4 cursor-pointer rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center transition hover:border-[#fb923c]/55 hover:bg-[#fb923c]/5 sm:p-8"
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
              <p className="font-bold text-white/80">
                {isEditing
                  ? "ارفع صورة بديلة أو اترك الصورة الحالية"
                  : "اسحب صورة هنا أو انقر للرفع"}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {isEditing
                  ? "رفع صورة جديدة يستبدل الصورة الحالية"
                  : "كل عمل ينحفظ كإضافة فردية"}
              </p>
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

            {selectedFiles.length || editingWork?.images[0] ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {selectedFiles.length === 0 && editingWork?.images[0] ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#fb923c]/40">
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
                    className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10"
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
                <span className="mb-2 block text-xs font-bold text-white/45">
                  اسم المجسم *
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-[#fb923c]/55 focus:ring-4 focus:ring-[#fb923c]/15"
                  placeholder="مثال: Dragon Skull"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">
                  المادة المطبوعة
                </span>
                <select
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#21212d] px-4 text-white outline-none transition focus:border-[#fb923c]/55 focus:ring-4 focus:ring-[#fb923c]/15"
                >
                  {["PLA", "PETG", "ABS", "ASA", "TPU", "Resin", "Nylon", "أخرى"].map(
                    (item) => (
                      <option key={item}>{item}</option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">
                  مدة الطباعة (ساعات)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={printHours}
                  onChange={(event) => setPrintHours(event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-[#fb923c]/55 focus:ring-4 focus:ring-[#fb923c]/15"
                  placeholder="6.5"
                />
              </label>

              <div>
                <span className="mb-2 block text-xs font-bold text-white/45">
                  طريقة التلوين
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["none", "printed", "painted"] as ColorMethod[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setColorMethod(item)}
                      className={`h-11 rounded-xl border px-3 text-sm transition ${
                        colorMethod === item
                          ? "border-[#fb923c]/55 bg-[#fb923c]/10 text-[#fb923c]"
                          : "border-white/10 bg-white/5 text-white/55 hover:text-white"
                      }`}
                    >
                      {colorLabels[item]}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-white/45">
                  وصف (اختياري)
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#fb923c]/55 focus:ring-4 focus:ring-[#fb923c]/15"
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
                className="h-11 rounded-xl border border-white/10 px-5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveWork}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-5 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
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

      {confirmDelete ? (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/80 p-4 backdrop-blur"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#13131b] p-6 shadow-2xl shadow-black/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/30 bg-red-600/15 text-red-300">
              <Trash2 size={20} />
            </div>
            <h2 className="mt-4 text-lg font-black text-white">حذف العمل</h2>
            <p className="mt-2 text-sm leading-7 text-white/55">
              هل أنت متأكد من حذف &ldquo;{confirmDelete.name}&rdquo;؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="h-10 rounded-xl border border-white/10 px-4 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => deleteWork(confirmDelete)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-500"
              >
                <Trash2 size={14} />
                حذف
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightbox(null);
          }}
        >
          <button
            type="button"
            title="إغلاق"
            aria-label="إغلاق"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5 sm:top-5"
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
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5"
              >
                <ChevronRight size={24} />
              </button>
              <button
                type="button"
                title="الصورة التالية"
                aria-label="الصورة التالية"
                onClick={() => navigateLightbox(1)}
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-5"
              >
                <ChevronLeft size={24} />
              </button>
            </>
          ) : null}

          <div className="w-full max-w-4xl px-2 text-center sm:px-14">
            <img
              src={lightbox.work.images[lightbox.index]}
              alt={lightbox.work.name}
              className="mx-auto max-h-[68vh] max-w-full rounded-2xl object-contain shadow-2xl shadow-black/60"
            />
            <h2 className="mt-5 text-lg font-black text-white sm:text-xl">
              {lightbox.work.name}
            </h2>
            {adminMode ? (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openEditModal(lightbox.work);
                    setLightbox(null);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition hover:border-[#fb923c]/45 hover:text-[#fb923c]"
                >
                  <Pencil size={14} />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(lightbox.work);
                    setLightbox(null);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-300/25 bg-red-600/85 px-4 text-sm font-bold text-white transition hover:bg-red-500"
                >
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Tag className="border-[#fb923c]/30 bg-[#fb923c]/10 text-[#fb923c]">
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
          className={`fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-2xl border bg-[#1a1a24]/95 px-5 py-3 text-sm shadow-2xl shadow-black/40 backdrop-blur ${
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
