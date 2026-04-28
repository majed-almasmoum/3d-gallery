"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Images,
  Lock,
  MessageCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Nav } from "@/components/nav";
import type { SiteBlockKey, SiteContent, SiteSectionKey, SiteSocial } from "@/types/site";

type VerifyResult = {
  ok: boolean;
  error?: string;
};

type EditableBlockProps = {
  blockKey: SiteBlockKey;
  label: string;
  editing: boolean;
  width: number;
  minHeight: number;
  sectionClassName?: string;
  draggable?: boolean;
  allowHide?: boolean;
  hidden?: boolean;
  onResize: (next: { width: number; minHeight: number }) => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  onToggleHidden?: () => void;
  children: React.ReactNode;
};

const socialIconFallbacks: Record<SiteSocial["key"], string> = {
  whatsapp: "/social/whatsapp.webp",
  instagram: "/social/instagram.png",
  tiktok: "/social/tiktok.webp",
  email: "/social/gmail.jpg",
};

const sectionLabels: Record<SiteSectionKey, string> = {
  profile: "بطاقة الاستوديو",
  printers: "الطابعات",
  socials: "التواصل",
  about: "نبذة عني",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "حدث خطأ غير متوقع";
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
      return { ok: false, error: data.error || "كلمة المرور غير صحيحة" };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

function EditableBlock({
  label,
  editing,
  width,
  minHeight,
  sectionClassName = "pb-14",
  draggable = false,
  allowHide = false,
  hidden = false,
  onResize,
  onDragStart,
  onDrop,
  onToggleHidden,
  children,
}: EditableBlockProps) {
  const resizableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editing || !resizableRef.current) return;

    const element = resizableRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !element.parentElement) return;

      const parentWidth = element.parentElement.clientWidth || 1;
      const nextWidth = Math.min(100, Math.max(48, Math.round((entry.contentRect.width / parentWidth) * 100)));
      const nextHeight = Math.max(0, Math.round(entry.contentRect.height));

      onResize({ width: nextWidth, minHeight: nextHeight });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [editing, onResize]);

  return (
    <section className={`mx-auto max-w-6xl px-5 ${sectionClassName}`}>
      <div className="mx-auto" style={{ width: `${width}%` }}>
        <div
          data-block-label={label}
          ref={resizableRef}
          draggable={editing && draggable}
          onDragStart={() => {
            if (editing) onDragStart?.();
          }}
          onDragOver={(event) => {
            if (!editing || !draggable) return;
            event.preventDefault();
          }}
          onDrop={(event) => {
            if (!editing || !draggable) return;
            event.preventDefault();
            onDrop?.();
          }}
          style={{ minHeight: minHeight || undefined }}
          className={`relative mx-auto transition ${
            editing
              ? "overflow-auto rounded-[34px] border border-dashed border-[#f5c97a]/35 bg-[#0f0f15]/30 p-2 [resize:both]"
              : ""
          }`}
        >
          {editing ? (
            <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-2">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#f5c97a]/25 bg-[#111118]/90 px-3 py-1.5 text-xs text-white/70 backdrop-blur">
                {draggable ? <GripVertical size={14} className="text-[#f5c97a]" /> : null}
                <span>{label}</span>
              </div>
              {allowHide ? (
                <button
                  type="button"
                  onClick={onToggleHidden}
                  className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#111118]/90 text-white/65 transition hover:border-[#f5c97a]/35 hover:text-white"
                >
                  {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}

export function HomeClient({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [draft, setDraft] = useState(initialContent);
  const [adminMode, setAdminMode] = useState(false);
  const [canvasEditMode, setCanvasEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [draggingSection, setDraggingSection] = useState<SiteSectionKey | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "ok" | "err" } | null>(null);

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
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message: string, type: "ok" | "err" = "ok") {
    setToast({ message, type });
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
      setCanvasEditMode(false);
      setAdminPassword("");
      sessionStorage.removeItem("adminPw");
      return;
    }

    setShowPasswordModal(true);
  }

  function openCanvasEditor() {
    setDraft(content);
    setCanvasEditMode(true);
  }

  function closeCanvasEditor() {
    setDraft(content);
    setCanvasEditMode(false);
    setDraggingSection(null);
  }

  function updateBlockStyle(blockKey: SiteBlockKey, patch: Partial<SiteContent["layout"]["blockStyles"][SiteBlockKey]>) {
    setDraft((current) => ({
      ...current,
      layout: {
        ...current.layout,
        blockStyles: {
          ...current.layout.blockStyles,
          [blockKey]: {
            ...current.layout.blockStyles[blockKey],
            ...patch,
          },
        },
      },
    }));
  }

  function updateSectionOrder(section: SiteSectionKey, direction: -1 | 1) {
    const currentIndex = draft.layout.sectionOrder.indexOf(section);
    const nextIndex = currentIndex + direction;
    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= draft.layout.sectionOrder.length) return;

    const nextOrder = [...draft.layout.sectionOrder];
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];

    setDraft((current) => ({
      ...current,
      layout: {
        ...current.layout,
        sectionOrder: nextOrder,
      },
    }));
  }

  function reorderSectionsByDrop(target: SiteSectionKey) {
    if (!draggingSection || draggingSection === target) return;

    setDraft((current) => {
      const filtered = current.layout.sectionOrder.filter((item) => item !== draggingSection);
      const targetIndex = filtered.indexOf(target);
      filtered.splice(targetIndex, 0, draggingSection);

      return {
        ...current,
        layout: {
          ...current.layout,
          sectionOrder: filtered,
        },
      };
    });
    setDraggingSection(null);
  }

  async function saveContent() {
    setSaving(true);

    try {
      const response = await fetch("/api/site", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ content: draft }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر حفظ بيانات الصفحة");
      }

      setContent(data.content);
      setDraft(data.content);
      showToast("تم حفظ التعديلات", "ok");
    } catch (error) {
      showToast(getErrorMessage(error), "err");
    } finally {
      setSaving(false);
    }
  }

  const view = canvasEditMode ? draft : content;
  const titleSize = `clamp(2.4rem, 7vw, ${(view.layout.titleScale / 100) * 5.8}rem)`;
  const statsGridClass =
    view.layout.statsColumns === 1
      ? "xl:grid-cols-1"
      : view.layout.statsColumns === 2
        ? "sm:grid-cols-2 xl:grid-cols-2"
        : "sm:grid-cols-2 xl:grid-cols-3";
  const printerGridClass =
    view.layout.printerColumns === 1
      ? "lg:grid-cols-1"
      : view.layout.printerColumns === 2
        ? "sm:grid-cols-2 lg:grid-cols-2"
        : view.layout.printerColumns === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";
  const socialGridClass =
    view.layout.socialColumns === 2
      ? "grid-cols-2"
      : view.layout.socialColumns === 3
        ? "grid-cols-3"
        : "grid-cols-2 sm:grid-cols-4";

  const activeSections = view.layout.sectionOrder.filter((section) => {
    if (section === "profile" && !view.layout.showProfileCard) return false;
    return !view.layout.blockStyles[section].hidden;
  });

  function renderHeroContent() {
    return (
      <div className="luxury-panel rounded-[34px] p-7 sm:p-9 lg:p-11">
        <p className="mb-5 inline-flex rounded-full border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold-strong)]">
          {view.badge}
        </p>

        <div className="max-w-3xl">
          <h1 className="font-display leading-[0.92] text-[var(--foreground)]" style={{ fontSize: titleSize }}>
            {view.titleLine1}
            <br />
            <span className="text-[color:var(--gold)]">{view.titleLine2}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">{view.subtitle}</p>
        </div>

        <div className={`mt-8 grid gap-3 ${statsGridClass}`}>
          {view.stats.map((stat) => (
            <div key={`${stat.value}-${stat.label}`} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <div className="font-display text-3xl text-[color:var(--gold)]">{stat.value}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--subtle)]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {["Commissioned Pieces", "Refined Finish", "Custom Scale", "Collector Display"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--subtle)]"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/gallery"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-strong))] px-5 text-sm font-bold text-black shadow-lg shadow-black/35 transition hover:opacity-90 sm:px-6"
          >
            <Images size={18} />
            استعرض الأعمال
          </Link>
          <a
            href={view.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-[color:var(--gold)]/20 bg-[color:var(--crimson)]/18 px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[color:var(--gold)]/40 hover:bg-[color:var(--crimson)]/26 sm:px-6"
          >
            <MessageCircle size={18} />
            تواصل مباشر
          </a>
        </div>
      </div>
    );
  }

  function renderProfileContent() {
    return (
      <div className="luxury-panel rounded-[30px] p-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--subtle)]">Studio Profile</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="border-b border-white/8 pb-4 sm:border-b-0 sm:border-l sm:pl-4">
            <div className="font-display text-3xl text-[color:var(--gold)]">{view.printers.length}</div>
            <p className="mt-2 text-sm text-[var(--muted)]">منصات طباعة مخصصة لأحجام وأنماط مختلفة</p>
          </div>
          <div className="border-b border-white/8 pb-4 sm:border-b-0 sm:border-l sm:pl-4">
            <div className="font-display text-3xl text-[color:var(--gold)]">{view.socials.length}</div>
            <p className="mt-2 text-sm text-[var(--muted)]">قنوات جاهزة لاستقبال الطلبات والتواصل</p>
          </div>
          <div>
            <div className="font-display text-3xl text-[color:var(--gold)]">2022</div>
            <p className="mt-2 text-sm text-[var(--muted)]">بداية الرحلة التي تحولت من هواية إلى أسلوب عرض متكامل</p>
          </div>
        </div>
      </div>
    );
  }

  function renderPrintersContent() {
    return (
      <div className={`grid gap-4 ${printerGridClass}`}>
        {view.printers.map((printer, index) => (
          <article
            key={`${printer.name}-${index}`}
            className="luxury-panel rounded-[26px] p-5 transition hover:-translate-y-1 hover:border-[color:var(--gold)]/25"
          >
            <div className="mb-4 h-px w-16 bg-[linear-gradient(90deg,var(--gold),transparent)]" />
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--subtle)]">Printer {index + 1}</div>
            <h2 className="font-display mt-3 text-2xl text-[var(--foreground)]">{printer.name}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{printer.desc}</p>
          </article>
        ))}
      </div>
    );
  }

  function renderSocialsContent() {
    return (
      <div className="luxury-panel rounded-[30px] p-7 sm:p-8">
        <div className="mb-6 border-b border-white/8 pb-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--subtle)]">Connect</p>
          <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">التواصل</h2>
        </div>

        <div className={`grid gap-4 ${socialGridClass}`}>
          {view.socials.map((social) => {
            const iconSrc = social.iconSrc || socialIconFallbacks[social.key];

            return (
              <a
                key={social.key}
                href={social.href}
                title={social.name}
                aria-label={`${social.name} ${social.handle}`}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:-translate-y-1 hover:border-[color:var(--gold)]/28 hover:bg-white/[0.06]"
              >
                <span
                  className="relative flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg shadow-black/15"
                  style={{
                    width: `${view.layout.socialIconSize}px`,
                    height: `${view.layout.socialIconSize}px`,
                  }}
                >
                  <Image
                    src={iconSrc}
                    alt={social.name}
                    width={view.layout.socialIconSize}
                    height={view.layout.socialIconSize}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="sr-only">{social.handle}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  function renderAboutContent() {
    return (
      <div className="luxury-panel rounded-[30px] p-7 sm:p-9">
        <div className="mb-6 border-b border-white/8 pb-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--subtle)]">About</p>
          <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">نبذة عني</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {view.about.map((paragraph, index) => (
            <p key={`${paragraph}-${index}`} className={`text-sm leading-8 text-[var(--muted)] ${index === 0 ? "lg:pl-4" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    );
  }

  function renderSection(section: SiteSectionKey) {
    const blockStyle = view.layout.blockStyles[section];
    const isHidden = Boolean(blockStyle.hidden);

    if (section === "profile" && !view.layout.showProfileCard) return null;

    return (
      <EditableBlock
        key={section}
        blockKey={section}
        label={sectionLabels[section]}
        editing={canvasEditMode}
        width={blockStyle.width}
        minHeight={blockStyle.minHeight}
        draggable
        allowHide
        hidden={isHidden}
        onResize={(next) => updateBlockStyle(section, next)}
        onDragStart={() => setDraggingSection(section)}
        onDrop={() => reorderSectionsByDrop(section)}
        onToggleHidden={() => updateBlockStyle(section, { hidden: !draft.layout.blockStyles[section].hidden })}
      >
        {section === "profile" ? renderProfileContent() : null}
        {section === "printers" ? renderPrintersContent() : null}
        {section === "socials" ? renderSocialsContent() : null}
        {section === "about" ? renderAboutContent() : null}
      </EditableBlock>
    );
  }

  return (
    <main className="theme-shell min-h-screen text-[var(--foreground)]">
      <Nav active="home" />

      <EditableBlock
        blockKey="hero"
        label="الهيرو الرئيسي"
        editing={canvasEditMode}
        width={view.layout.blockStyles.hero.width}
        minHeight={view.layout.blockStyles.hero.minHeight}
        sectionClassName="pb-12 pt-10 sm:pt-12 lg:pt-16"
        onResize={(next) => updateBlockStyle("hero", next)}
      >
        {renderHeroContent()}
      </EditableBlock>

      {activeSections.map((section) => renderSection(section))}

      {canvasEditMode ? (
        <aside className="fixed inset-y-4 left-4 z-50 w-[min(390px,calc(100vw-2rem))] overflow-y-auto rounded-[28px] border border-white/10 bg-[#111117]/94 p-4 shadow-2xl shadow-black/45 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-black text-white">تحرير حي للصفحة</h2>
              <p className="mt-1 text-xs text-white/45">اسحب البلوكات بالماوس، وكبّرها وصغّرها من الزاوية السفلية.</p>
            </div>
            <button
              type="button"
              onClick={closeCanvasEditor}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-black text-white">النصوص والعناوين</h3>
              <div className="space-y-3">
                <input
                  value={draft.badge}
                  onChange={(event) => setDraft({ ...draft, badge: event.target.value })}
                  placeholder="الشارة"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
                <input
                  value={draft.titleLine1}
                  onChange={(event) => setDraft({ ...draft, titleLine1: event.target.value })}
                  placeholder="العنوان الأول"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
                <input
                  value={draft.titleLine2}
                  onChange={(event) => setDraft({ ...draft, titleLine2: event.target.value })}
                  placeholder="العنوان الثاني"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
                <textarea
                  value={draft.subtitle}
                  onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })}
                  rows={4}
                  placeholder="الوصف الرئيسي"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#fb923c]/50"
                />
                <input
                  value={draft.whatsappUrl}
                  onChange={(event) => setDraft({ ...draft, whatsappUrl: event.target.value })}
                  placeholder="رابط الواتساب"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-black text-white">القوالب والبلوكات</h3>
              <div className="space-y-2">
                {draft.layout.sectionOrder.map((section, index) => (
                  <div key={section} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white/55">
                        {index + 1}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">{sectionLabels[section]}</div>
                        <div className="text-[11px] text-white/40">اسحب البلوك من الصفحة أو رتبه من هنا</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateSectionOrder(section, -1)}
                        disabled={index === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSectionOrder(section, 1)}
                        disabled={index === draft.layout.sectionOrder.length - 1}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateBlockStyle(section, { hidden: !draft.layout.blockStyles[section].hidden })
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                      >
                        {draft.layout.blockStyles[section].hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-black text-white">التحكم في الشكل</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-bold text-white/60">
                    <span>حجم العنوان الرئيسي</span>
                    <span>{draft.layout.titleScale}%</span>
                  </span>
                  <input
                    type="range"
                    min="70"
                    max="130"
                    value={draft.layout.titleScale}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        layout: {
                          ...draft.layout,
                          titleScale: Number(event.target.value),
                        },
                      })
                    }
                    className="w-full accent-[#f5c97a]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-bold text-white/60">
                    <span>حجم أيقونات التواصل</span>
                    <span>{draft.layout.socialIconSize}px</span>
                  </span>
                  <input
                    type="range"
                    min="36"
                    max="72"
                    value={draft.layout.socialIconSize}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        layout: {
                          ...draft.layout,
                          socialIconSize: Number(event.target.value),
                        },
                      })
                    }
                    className="w-full accent-[#f5c97a]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-black text-white">الإحصائيات</h3>
              <div className="space-y-3">
                {draft.stats.map((stat, index) => (
                  <div key={`${stat.value}-${index}`} className="grid gap-2 rounded-2xl border border-white/8 bg-black/20 p-3">
                    <input
                      value={stat.value}
                      onChange={(event) => {
                        const stats = [...draft.stats];
                        stats[index] = { ...stat, value: event.target.value };
                        setDraft({ ...draft, stats });
                      }}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                    />
                    <input
                      value={stat.label}
                      onChange={(event) => {
                        const stats = [...draft.stats];
                        stats[index] = { ...stat, label: event.target.value };
                        setDraft({ ...draft, stats });
                      }}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-black text-white">الطابعات</h3>
              <textarea
                value={draft.printers.map((printer) => `${printer.name} | ${printer.desc}`).join("\n")}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    printers: event.target.value
                      .split("\n")
                      .map((line) => {
                        const [name = "", desc = ""] = line.split("|").map((item) => item.trim());
                        return { name, desc };
                      })
                      .filter((printer) => printer.name),
                  })
                }
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#fb923c]/50"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-black text-white">التواصل</h3>
              <div className="space-y-3">
                {draft.socials.map((social, index) => (
                  <div key={social.key} className="grid gap-2 rounded-2xl border border-white/8 bg-black/20 p-3">
                    <input
                      value={social.handle}
                      onChange={(event) => {
                        const socials = [...draft.socials];
                        socials[index] = { ...social, handle: event.target.value };
                        setDraft({ ...draft, socials });
                      }}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                    />
                    <input
                      value={social.href}
                      onChange={(event) => {
                        const socials = [...draft.socials];
                        socials[index] = { ...social, href: event.target.value };
                        setDraft({ ...draft, socials });
                      }}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-black text-white">نبذة عني</h3>
              <textarea
                value={draft.about.join("\n\n")}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    about: event.target.value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean),
                  })
                }
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#fb923c]/50"
              />
            </div>
          </div>

          <div className="sticky bottom-0 mt-5 border-t border-white/10 bg-[#111117]/95 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeCanvasEditor}
                className="h-11 flex-1 rounded-xl border border-white/10 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveContent}
                disabled={saving}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#fb923c] to-[#f59e0b] text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-45"
              >
                <Save size={16} />
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {adminMode ? (
          <button
            type="button"
            title="تحرير الصفحة"
            aria-label="تحرير الصفحة"
            onClick={() => {
              if (canvasEditMode) {
                closeCanvasEditor();
              } else {
                openCanvasEditor();
              }
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-l from-[#fb923c] to-[#f59e0b] text-black shadow-xl shadow-black/35 transition hover:scale-105"
          >
            <Pencil size={22} />
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

      {toast ? (
        <div
          className={`fixed bottom-6 right-1/2 z-[70] translate-x-1/2 rounded-lg border bg-[#1e1e2e] px-5 py-3 text-sm shadow-xl shadow-black/40 ${
            toast.type === "ok" ? "border-emerald-300/35 text-emerald-300" : "border-red-300/35 text-red-300"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <footer className="border-t border-white/10 px-5 py-7 text-center text-xs text-white/30">
        © 2026 Majed Almasmoum · 3D Printing Portfolio
      </footer>
    </main>
  );
}
