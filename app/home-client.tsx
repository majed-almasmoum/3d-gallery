"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Images,
  Loader2,
  MessageCircle,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Nav } from "@/components/nav";
import {
  GmailIcon,
  InstagramIcon,
  TiktokIcon,
  WhatsappIcon,
} from "@/components/brand-icons";
import { useAdmin } from "@/components/admin-context";
import type {
  SiteContent,
  SitePrinter,
  SiteSocial,
  SiteStat,
} from "@/types/site-content";

type Toast = { message: string; type: "ok" | "err" };

const brandIconMap: Record<SiteSocial["brand"], React.ComponentType<{ size?: number; className?: string }>> = {
  whatsapp: WhatsappIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  gmail: GmailIcon,
};

const brandLabel: Record<SiteSocial["brand"], string> = {
  whatsapp: "واتساب",
  instagram: "انستقرام",
  tiktok: "تيكتوك",
  gmail: "البريد",
};

const brandRing: Record<SiteSocial["brand"], string> = {
  whatsapp: "from-[#25d366]/30 to-[#25d366]/0",
  instagram: "from-[#e1306c]/30 to-[#fdcb52]/0",
  tiktok: "from-[#25f4ee]/25 to-[#fe2c55]/0",
  gmail: "from-[#ea4335]/25 to-[#4285f4]/0",
};

export function HomeClient({ initialContent }: { initialContent: SiteContent }) {
  const { adminMode, adminPassword } = useAdmin();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const editing = adminMode && draft !== null;
  const view = editing && draft ? draft : content;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message: string, type: Toast["type"] = "ok") {
    setToast({ message, type });
  }

  function startEditing() {
    setDraft(structuredClone(content));
  }

  function cancelEditing() {
    setDraft(null);
  }

  function updateDraft<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function saveDraft() {
    if (!draft) return;
    setSaving(true);
    try {
      const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ content: draft }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "تعذر الحفظ");
      }
      setContent(data.content as SiteContent);
      setDraft(null);
      showToast("تم حفظ التعديلات");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "تعذر الحفظ", "err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080c] text-[#f0ece4]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.18),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
      />

      <Nav active="home" />

      {adminMode ? (
        <div className="sticky top-16 z-20 border-b border-[#fb923c]/30 bg-[#fb923c]/10 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#fb923c]">
              <Sparkles size={14} /> وضع الإدارة مفعّل
            </span>
            {editing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="h-9 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-bold text-white/70 transition hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-3.5 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  حفظ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#fb923c]/35 bg-[#fb923c]/15 px-3.5 text-xs font-bold text-[#fb923c] transition hover:bg-[#fb923c]/25"
              >
                <Pencil size={14} />
                تعديل المحتوى
              </button>
            )}
          </div>
        </div>
      ) : null}

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1fr_auto] md:gap-14 md:py-20 sm:px-6">
        <div className="text-center md:text-right">
          {editing ? (
            <input
              value={view.hero.badge}
              onChange={(event) =>
                updateDraft("hero", { ...view.hero, badge: event.target.value })
              }
              className="mb-5 h-9 w-full max-w-xs rounded-full border border-[#fb923c]/40 bg-[#fb923c]/10 px-4 text-xs font-bold uppercase tracking-[0.08em] text-[#fb923c] outline-none focus:ring-4 focus:ring-[#fb923c]/15 md:mx-0"
            />
          ) : (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#fb923c]/35 bg-[#fb923c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#fb923c] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fb923c]" />
              {view.hero.badge}
            </p>
          )}

          {editing ? (
            <div className="space-y-2">
              <input
                value={view.hero.title}
                onChange={(event) =>
                  updateDraft("hero", { ...view.hero, title: event.target.value })
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-3xl font-black text-white outline-none focus:ring-4 focus:ring-[#fb923c]/15 sm:text-5xl"
              />
              <input
                value={view.hero.accent}
                onChange={(event) =>
                  updateDraft("hero", { ...view.hero, accent: event.target.value })
                }
                className="h-14 w-full rounded-2xl border border-[#fb923c]/30 bg-[#fb923c]/5 px-4 text-3xl font-black text-[#fb923c] outline-none focus:ring-4 focus:ring-[#fb923c]/15 sm:text-5xl"
              />
            </div>
          ) : (
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              {view.hero.title}
              <br />
              <span className="bg-gradient-to-l from-[#fb923c] to-[#f59e0b] bg-clip-text text-transparent">
                {view.hero.accent}
              </span>
            </h1>
          )}

          {editing ? (
            <textarea
              value={view.hero.description}
              onChange={(event) =>
                updateDraft("hero", { ...view.hero, description: event.target.value })
              }
              rows={3}
              className="mx-auto mt-5 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-8 text-white/75 outline-none focus:ring-4 focus:ring-[#fb923c]/15 md:mx-0"
            />
          ) : (
            <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/55 sm:text-base md:mx-0">
              {view.hero.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href="/gallery"
              className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-6 text-sm font-bold text-black shadow-lg shadow-[#fb923c]/25 transition hover:translate-y-[-2px] hover:shadow-xl hover:shadow-[#fb923c]/30"
            >
              <Images size={18} />
              معرض الأعمال
              <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
            </Link>
            <a
              href="https://wa.me/966568866602"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/75 backdrop-blur transition hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              <MessageCircle size={18} />
              تواصل معي
            </a>
          </div>
        </div>

        <div className="relative mx-auto">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#fb923c]/40 to-transparent blur-2xl"
          />
          <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#16161f] to-[#0c0c12] shadow-2xl shadow-black/40 sm:h-60 sm:w-60">
            <Image
              src="/logo.PNG"
              alt="3D Portfolio Logo"
              width={320}
              height={320}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <StatsSection
        editing={editing}
        stats={view.stats}
        onChange={(value) => updateDraft("stats", value)}
      />

      <PrintersSection
        editing={editing}
        printers={view.printers}
        onChange={(value) => updateDraft("printers", value)}
      />

      <AboutSection
        editing={editing}
        paragraphs={view.about}
        onChange={(value) => updateDraft("about", value)}
      />

      <SocialsSection
        editing={editing}
        socials={view.socials}
        onChange={(value) => updateDraft("socials", value)}
      />

      <footer className="border-t border-white/10 px-4 py-7 text-center text-xs text-white/30 sm:px-6">
        © 2026 Majed Almasmoum · 3D Printing Portfolio
      </footer>

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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
        {children}
      </p>
      <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
    </div>
  );
}

function StatsSection({
  editing,
  stats,
  onChange,
}: {
  editing: boolean;
  stats: SiteStat[];
  onChange: (value: SiteStat[]) => void;
}) {
  function update(index: number, key: keyof SiteStat, value: string) {
    onChange(stats.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function remove(index: number) {
    onChange(stats.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...stats, { value: "0", label: "وصف جديد" }]);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#15151d] to-[#0e0e14] p-5 transition hover:border-[#fb923c]/40 sm:p-6"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#fb923c]/10 blur-2xl"
            />
            {editing ? (
              <>
                <input
                  value={stat.value}
                  onChange={(event) => update(index, "value", event.target.value)}
                  className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-2xl font-black text-[#fb923c] outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                />
                <textarea
                  value={stat.label}
                  onChange={(event) => update(index, "label", event.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm leading-7 text-white/65 outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-3 inline-flex h-8 items-center gap-1 rounded-lg border border-red-300/25 bg-red-600/15 px-3 text-xs font-bold text-red-300 transition hover:bg-red-600/25"
                >
                  <Trash2 size={12} />
                  حذف
                </button>
              </>
            ) : (
              <>
                <div className="mb-2 text-2xl font-black text-[#fb923c] sm:text-3xl">
                  {stat.value}
                </div>
                <p className="text-sm leading-7 text-white/55">{stat.label}</p>
              </>
            )}
          </div>
        ))}
        {editing ? (
          <button
            type="button"
            onClick={add}
            className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] text-sm font-bold text-white/50 transition hover:border-[#fb923c]/40 hover:text-[#fb923c]"
          >
            <Plus size={18} />
            إضافة بطاقة
          </button>
        ) : null}
      </div>
    </section>
  );
}

function PrintersSection({
  editing,
  printers,
  onChange,
}: {
  editing: boolean;
  printers: SitePrinter[];
  onChange: (value: SitePrinter[]) => void;
}) {
  function update(index: number, key: keyof SitePrinter, value: string) {
    onChange(printers.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function remove(index: number) {
    onChange(printers.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...printers, { name: "طابعة جديدة", desc: "وصف الطابعة" }]);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <SectionHeader>الطابعات المستخدمة</SectionHeader>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {printers.map((printer, index) => (
          <article
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#15151d] to-[#0e0e14] p-5 transition hover:-translate-y-1 hover:border-[#fb923c]/40"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-5 top-0 h-px bg-gradient-to-l from-transparent via-[#fb923c]/40 to-transparent opacity-0 transition group-hover:opacity-100"
            />
            {editing ? (
              <>
                <input
                  value={printer.name}
                  onChange={(event) => update(index, "name", event.target.value)}
                  className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-base font-bold text-white outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                />
                <textarea
                  value={printer.desc}
                  onChange={(event) => update(index, "desc", event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm leading-7 text-white/55 outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-3 inline-flex h-8 items-center gap-1 rounded-lg border border-red-300/25 bg-red-600/15 px-3 text-xs font-bold text-red-300 transition hover:bg-red-600/25"
                >
                  <Trash2 size={12} />
                  حذف
                </button>
              </>
            ) : (
              <>
                <h2 className="mb-2 text-base font-bold text-white">{printer.name}</h2>
                <p className="text-sm leading-7 text-white/50">{printer.desc}</p>
              </>
            )}
          </article>
        ))}
        {editing ? (
          <button
            type="button"
            onClick={add}
            className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] text-sm font-bold text-white/50 transition hover:border-[#fb923c]/40 hover:text-[#fb923c]"
          >
            <Plus size={18} />
            إضافة طابعة
          </button>
        ) : null}
      </div>
    </section>
  );
}

function AboutSection({
  editing,
  paragraphs,
  onChange,
}: {
  editing: boolean;
  paragraphs: string[];
  onChange: (value: string[]) => void;
}) {
  function update(index: number, value: string) {
    onChange(paragraphs.map((item, i) => (i === index ? value : item)));
  }

  function remove(index: number) {
    onChange(paragraphs.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...paragraphs, ""]);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <SectionHeader>نبذة عني</SectionHeader>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#15151d] to-[#0e0e14] p-6 shadow-xl shadow-black/30 sm:p-8">
        {editing ? (
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={paragraph}
                  onChange={(event) => update(index, event.target.value)}
                  rows={3}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-8 text-white/75 outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  title="حذف الفقرة"
                  aria-label="حذف الفقرة"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-300/25 bg-red-600/15 text-red-300 transition hover:bg-red-600/25"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={add}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-3.5 text-xs font-bold text-white/55 transition hover:border-[#fb923c]/40 hover:text-[#fb923c]"
            >
              <Plus size={14} />
              إضافة فقرة
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm leading-8 text-white/65 sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SocialsSection({
  editing,
  socials,
  onChange,
}: {
  editing: boolean;
  socials: SiteSocial[];
  onChange: (value: SiteSocial[]) => void;
}) {
  function update(index: number, key: keyof SiteSocial, value: string) {
    onChange(
      socials.map((item, i) =>
        i === index ? { ...item, [key]: value as SiteSocial[typeof key] } : item,
      ),
    );
  }

  function remove(index: number) {
    onChange(socials.filter((_, i) => i !== index));
  }

  function add() {
    onChange([
      ...socials,
      {
        brand: "whatsapp",
        name: "تواصل",
        handle: "—",
        href: "https://",
      },
    ]);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <SectionHeader>التواصل</SectionHeader>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {socials.map((social, index) => {
          const Icon = brandIconMap[social.brand];
          if (editing) {
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#15151d] p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <select
                    value={social.brand}
                    onChange={(event) =>
                      update(index, "brand", event.target.value as SiteSocial["brand"])
                    }
                    className="h-9 rounded-lg border border-white/10 bg-[#21212d] px-3 text-xs text-white outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                  >
                    {(Object.keys(brandLabel) as SiteSocial["brand"][]).map((brand) => (
                      <option key={brand} value={brand}>
                        {brandLabel[brand]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    title="حذف"
                    aria-label="حذف"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-300/25 bg-red-600/15 text-red-300 transition hover:bg-red-600/25"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <input
                  value={social.name}
                  onChange={(event) => update(index, "name", event.target.value)}
                  placeholder="الاسم"
                  className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                />
                <input
                  value={social.handle}
                  onChange={(event) => update(index, "handle", event.target.value)}
                  placeholder="المعرف"
                  className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/70 outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                />
                <input
                  value={social.href}
                  onChange={(event) => update(index, "href", event.target.value)}
                  placeholder="الرابط"
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/60 outline-none focus:ring-4 focus:ring-[#fb923c]/15"
                  dir="ltr"
                />
              </div>
            );
          }

          return (
            <a
              key={index}
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noreferrer" : undefined}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#15151d] to-[#0e0e14] p-4 transition hover:-translate-y-1 hover:border-white/25 sm:p-5"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition group-hover:opacity-100 ${brandRing[social.brand]}`}
              />
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition group-hover:bg-white/10">
                <Icon size={26} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">{social.name}</span>
                <span className="block truncate text-xs text-white/45">{social.handle}</span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-white/65" />
            </a>
          );
        })}
        {editing ? (
          <button
            type="button"
            onClick={add}
            className="flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] text-sm font-bold text-white/50 transition hover:border-[#fb923c]/40 hover:text-[#fb923c]"
          >
            <Plus size={18} />
            إضافة وسيلة تواصل
          </button>
        ) : null}
      </div>
    </section>
  );
}
