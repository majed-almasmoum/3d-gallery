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
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-[#F5F0E8]">
      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <Nav active="home" />

      {/* Admin bar */}
      {adminMode ? (
        <div className="sticky top-[72px] z-20 border-b border-[#9A7A4A]/30 bg-[#9A7A4A]/10 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#C9A96E]">
              <Sparkles size={14} /> وضع الإدارة مفعّل
            </span>
            {editing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="h-9 border border-[#2A2724] bg-[#141414] px-3.5 text-xs font-bold text-[#A09A90] transition hover:bg-[#1E1C1C]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-1.5 bg-[#8C1A1A] px-3.5 text-xs font-bold text-[#F5F0E8] transition hover:bg-[#B22222] disabled:opacity-60"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  حفظ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex h-9 items-center gap-1.5 border border-[#9A7A4A]/40 bg-[#9A7A4A]/10 px-3.5 text-xs font-bold text-[#C9A96E] transition hover:bg-[#9A7A4A]/20"
              >
                <Pencil size={14} />
                تعديل المحتوى
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1fr_auto] md:gap-20 md:py-28 sm:px-6">
        {/* Geometric accent box */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-16 hidden h-80 w-64 border border-[#C9A96E]/08 md:block"
        />

        <div className="text-right">
          {/* Badge */}
          {editing ? (
            <input
              value={view.hero.badge}
              onChange={(e) => updateDraft("hero", { ...view.hero, badge: e.target.value })}
              className="mb-6 h-9 w-full max-w-xs border border-[#9A7A4A]/40 bg-[#141414] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#C9A96E] outline-none focus:border-[#9A7A4A]"
            />
          ) : (
            <p className="mb-6 inline-flex items-center gap-2 border border-[#9A7A4A]/40 bg-[#9A7A4A]/08 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[#9A7A4A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9A7A4A]" />
              {view.hero.badge}
            </p>
          )}

          {/* Headline */}
          {editing ? (
            <div className="space-y-2">
              <input
                value={view.hero.title}
                onChange={(e) => updateDraft("hero", { ...view.hero, title: e.target.value })}
                className="h-14 w-full border border-[#2A2724] bg-[#141414] px-4 text-3xl font-black text-[#F5F0E8] outline-none focus:border-[#9A7A4A] sm:text-5xl"
              />
              <input
                value={view.hero.accent}
                onChange={(e) => updateDraft("hero", { ...view.hero, accent: e.target.value })}
                className="h-14 w-full border border-[#9A7A4A]/30 bg-[#9A7A4A]/05 px-4 text-3xl font-black text-[#C9A96E] outline-none focus:border-[#9A7A4A] sm:text-5xl"
              />
            </div>
          ) : (
            <h1
              className="text-4xl font-light leading-[1.1] tracking-tight text-[#F5F0E8] sm:text-6xl"
              style={{ fontFamily: "'Amiri', 'Cormorant Garamond', serif" }}
            >
              {view.hero.title}
              <br />
              <em className="not-italic text-[#C9A96E]">{view.hero.accent}</em>
            </h1>
          )}

          {/* Description */}
          {editing ? (
            <textarea
              value={view.hero.description}
              onChange={(e) => updateDraft("hero", { ...view.hero, description: e.target.value })}
              rows={3}
              className="mx-0 mt-5 w-full max-w-xl border border-[#2A2724] bg-[#141414] p-4 text-sm leading-8 text-[#A09A90] outline-none focus:border-[#9A7A4A]"
            />
          ) : (
            <p className="mt-6 max-w-xl text-sm leading-8 text-[#A09A90] sm:text-base">
              {view.hero.description}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap justify-end gap-3">
            <Link
              href="/gallery"
              className="group inline-flex h-12 items-center gap-2 bg-[#8C1A1A] px-7 text-sm font-medium uppercase tracking-[0.08em] text-[#F5F0E8] transition hover:bg-[#B22222]"
            >
              <Images size={16} />
              معرض الأعمال
              <ArrowLeft size={14} className="transition group-hover:-translate-x-1" />
            </Link>
            <a
              href="https://wa.me/966568866602"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 border border-[#9A7A4A]/50 bg-transparent px-7 text-sm font-medium uppercase tracking-[0.08em] text-[#C9A96E] transition hover:border-[#C9A96E] hover:bg-[#C9A96E]/08"
            >
              <MessageCircle size={16} />
              تواصل معي
            </a>
          </div>
        </div>

        {/* Logo block */}
        <div className="relative mx-auto">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4 border border-[#C9A96E]/10"
          />
          <div className="flex h-48 w-48 items-center justify-center overflow-hidden border border-[#2A2724] bg-[#141414] shadow-2xl shadow-black/60 sm:h-64 sm:w-64">
            <Image
              src="/logo.PNG"
              alt="Majed Almasmoum"
              width={320}
              height={320}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#9A7A4A]/40 to-transparent" />
      </div>

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

      {/* Footer */}
      <footer className="border-t border-[#2A2724] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="font-serif text-2xl italic text-[#B22222]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              M
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5A5450]">
              MAJED ALMASMOUM
            </span>
          </div>
          <span className="text-xs text-[#5A5450]">© 2026 · جميع الحقوق محفوظة</span>
        </div>
      </footer>

      {/* Toast */}
      {toast ? (
        <div
          className={`fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 border bg-[#141414]/95 px-5 py-3 text-sm shadow-2xl shadow-black/60 backdrop-blur ${
            toast.type === "ok"
              ? "border-[#9A7A4A]/50 text-[#C9A96E]"
              : "border-red-300/35 text-red-300"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </main>
  );
}

/* ── Section Header ──────────────────────────────── */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="h-px flex-1 bg-[#2A2724]" />
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5A5450]">
        {children}
      </p>
      <span className="h-px flex-1 bg-[#2A2724]" />
    </div>
  );
}

/* ── Stats Section ───────────────────────────────── */
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
      <div className="grid gap-px sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group border border-[#1E1C1C] bg-[#141414] p-7 transition hover:border-[#9A7A4A]/50"
          >
            {editing ? (
              <>
                <input
                  value={stat.value}
                  onChange={(e) => update(index, "value", e.target.value)}
                  className="mb-2 w-full border border-[#2A2724] bg-[#0A0A0A] px-3 py-1.5 text-2xl font-light text-[#C9A96E] outline-none focus:border-[#9A7A4A]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                />
                <textarea
                  value={stat.label}
                  onChange={(e) => update(index, "label", e.target.value)}
                  rows={2}
                  className="w-full border border-[#2A2724] bg-[#0A0A0A] px-3 py-2 text-sm leading-7 text-[#A09A90] outline-none focus:border-[#9A7A4A]"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-3 inline-flex h-8 items-center gap-1 border border-red-300/25 bg-red-600/10 px-3 text-xs font-bold text-red-300 transition hover:bg-red-600/20"
                >
                  <Trash2 size={12} /> حذف
                </button>
              </>
            ) : (
              <>
                <div
                  className="mb-2 text-4xl font-light text-[#C9A96E]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {stat.value}
                </div>
                <p className="text-sm leading-7 text-[#A09A90]">{stat.label}</p>
              </>
            )}
          </div>
        ))}
        {editing ? (
          <button
            type="button"
            onClick={add}
            className="flex min-h-[120px] flex-col items-center justify-center gap-2 border-2 border-dashed border-[#2A2724] bg-transparent text-sm font-medium text-[#5A5450] transition hover:border-[#9A7A4A]/50 hover:text-[#C9A96E]"
          >
            <Plus size={18} /> إضافة بطاقة
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ── Printers Section ────────────────────────────── */
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
      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
        {printers.map((printer, index) => (
          <article
            key={index}
            className="group relative border border-[#1E1C1C] bg-[#141414] p-6 transition hover:border-[#9A7A4A]/50"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-px bg-[#9A7A4A]/0 transition group-hover:bg-[#9A7A4A]/40"
            />
            {editing ? (
              <>
                <input
                  value={printer.name}
                  onChange={(e) => update(index, "name", e.target.value)}
                  className="mb-2 w-full border border-[#2A2724] bg-[#0A0A0A] px-3 py-1.5 text-base font-medium text-[#F5F0E8] outline-none focus:border-[#9A7A4A]"
                />
                <textarea
                  value={printer.desc}
                  onChange={(e) => update(index, "desc", e.target.value)}
                  rows={3}
                  className="w-full border border-[#2A2724] bg-[#0A0A0A] px-3 py-2 text-sm leading-7 text-[#A09A90] outline-none focus:border-[#9A7A4A]"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-3 inline-flex h-8 items-center gap-1 border border-red-300/25 bg-red-600/10 px-3 text-xs font-bold text-red-300 transition hover:bg-red-600/20"
                >
                  <Trash2 size={12} /> حذف
                </button>
              </>
            ) : (
              <>
                <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#9A7A4A]">
                  3D Printer
                </div>
                <h2 className="mb-2 text-base font-medium text-[#F5F0E8]">{printer.name}</h2>
                <p className="text-sm leading-7 text-[#5A5450]">{printer.desc}</p>
              </>
            )}
          </article>
        ))}
        {editing ? (
          <button
            type="button"
            onClick={add}
            className="flex min-h-[140px] flex-col items-center justify-center gap-2 border-2 border-dashed border-[#2A2724] bg-transparent text-sm font-medium text-[#5A5450] transition hover:border-[#9A7A4A]/50 hover:text-[#C9A96E]"
          >
            <Plus size={18} /> إضافة طابعة
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ── About Section ───────────────────────────────── */
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
      <div className="border border-[#1E1C1C] bg-[#141414] p-7 shadow-xl shadow-black/40 sm:p-10">
        {/* Gold accent line */}
        <div className="mb-7 h-px w-10 bg-[#9A7A4A]" />
        {editing ? (
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={paragraph}
                  onChange={(e) => update(index, e.target.value)}
                  rows={3}
                  className="flex-1 border border-[#2A2724] bg-[#0A0A0A] p-3 text-sm leading-8 text-[#A09A90] outline-none focus:border-[#9A7A4A]"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="حذف الفقرة"
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-red-300/25 bg-red-600/10 text-red-300 transition hover:bg-red-600/20"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={add}
              className="inline-flex h-9 items-center gap-1.5 border border-dashed border-[#2A2724] px-3.5 text-xs font-medium text-[#5A5450] transition hover:border-[#9A7A4A]/50 hover:text-[#C9A96E]"
            >
              <Plus size={14} /> إضافة فقرة
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm leading-9 text-[#A09A90] sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Socials Section ─────────────────────────────── */
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
    onChange([...socials, { brand: "whatsapp", name: "تواصل", handle: "—", href: "https://" }]);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <SectionHeader>التواصل</SectionHeader>
      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
        {socials.map((social, index) => {
          const Icon = brandIconMap[social.brand];
          if (editing) {
            return (
              <div key={index} className="border border-[#2A2724] bg-[#141414] p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <select
                    value={social.brand}
                    onChange={(e) => update(index, "brand", e.target.value as SiteSocial["brand"])}
                    className="h-9 border border-[#2A2724] bg-[#0A0A0A] px-3 text-xs text-[#F5F0E8] outline-none focus:border-[#9A7A4A]"
                  >
                    {(Object.keys(brandLabel) as SiteSocial["brand"][]).map((brand) => (
                      <option key={brand} value={brand}>{brandLabel[brand]}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="حذف"
                    className="flex h-8 w-8 items-center justify-center border border-red-300/25 bg-red-600/10 text-red-300 transition hover:bg-red-600/20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <input value={social.name} onChange={(e) => update(index, "name", e.target.value)} placeholder="الاسم" className="mb-2 h-9 w-full border border-[#2A2724] bg-[#0A0A0A] px-3 text-sm text-[#F5F0E8] outline-none focus:border-[#9A7A4A]" />
                <input value={social.handle} onChange={(e) => update(index, "handle", e.target.value)} placeholder="المعرف" className="mb-2 h-9 w-full border border-[#2A2724] bg-[#0A0A0A] px-3 text-xs text-[#A09A90] outline-none focus:border-[#9A7A4A]" />
                <input value={social.href} onChange={(e) => update(index, "href", e.target.value)} placeholder="الرابط" className="h-9 w-full border border-[#2A2724] bg-[#0A0A0A] px-3 text-xs text-[#A09A90] outline-none focus:border-[#9A7A4A]" dir="ltr" />
              </div>
            );
          }

          return (
            <a
              key={index}
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noreferrer" : undefined}
              className="group relative flex items-center gap-4 border border-[#1E1C1C] bg-[#141414] p-5 transition hover:border-[#9A7A4A]/50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#2A2724] bg-[#0A0A0A] transition group-hover:border-[#9A7A4A]/40">
                <Icon size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#F5F0E8]">{social.name}</span>
                <span className="block truncate text-xs text-[#5A5450]">{social.handle}</span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-[#5A5450] transition group-hover:text-[#9A7A4A]" />
            </a>
          );
        })}
        {editing ? (
          <button
            type="button"
            onClick={add}
            className="flex min-h-[110px] flex-col items-center justify-center gap-2 border-2 border-dashed border-[#2A2724] bg-transparent text-sm font-medium text-[#5A5450] transition hover:border-[#9A7A4A]/50 hover:text-[#C9A96E]"
          >
            <Plus size={18} /> إضافة وسيلة تواصل
          </button>
        ) : null}
      </div>
    </section>
  );
}
