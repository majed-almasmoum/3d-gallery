"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Images,
  Lock,
  MessageCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Nav } from "@/components/nav";
import type { SiteContent, SiteSocial } from "@/types/site";

type VerifyResult = {
  ok: boolean;
  error?: string;
};

const socialIconFallbacks: Record<SiteSocial["key"], string> = {
  whatsapp: "/social/whatsapp.webp",
  instagram: "/social/instagram.png",
  tiktok: "/social/tiktok.webp",
  email: "/social/gmail.jpg",
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

export function HomeClient({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [draft, setDraft] = useState(initialContent);
  const [adminMode, setAdminMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [saving, setSaving] = useState(false);
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
      setAdminPassword("");
      sessionStorage.removeItem("adminPw");
      return;
    }

    setShowPasswordModal(true);
  }

  function openEditModal() {
    setDraft(content);
    setShowEditModal(true);
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
      setShowEditModal(false);
      showToast("تم حفظ بيانات الصفحة", "ok");
    } catch (error) {
      showToast(getErrorMessage(error), "err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="theme-shell min-h-screen text-[var(--foreground)]">
      <Nav active="home" />

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:pt-12 lg:pt-16">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div className="luxury-panel rounded-[34px] p-7 sm:p-9 lg:p-11">
            <p className="mb-5 inline-flex rounded-full border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold-strong)]">
              {content.badge}
            </p>

            <div className="max-w-3xl">
              <h1 className="font-display text-[clamp(2.7rem,8vw,5.8rem)] leading-[0.92] text-[var(--foreground)]">
                {content.titleLine1}
                <br />
                <span className="text-[color:var(--gold)]">{content.titleLine2}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
                {content.subtitle}
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {content.stats.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                >
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
                href={content.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-[color:var(--gold)]/20 bg-[color:var(--crimson)]/18 px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[color:var(--gold)]/40 hover:bg-[color:var(--crimson)]/26 sm:px-6"
              >
                <MessageCircle size={18} />
                تواصل مباشر
              </a>
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="luxury-panel rounded-[30px] p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--subtle)]">
                Studio Profile
              </p>
              <div className="mt-5 grid gap-4">
                <div className="border-b border-white/8 pb-4">
                  <div className="font-display text-3xl text-[color:var(--gold)]">{content.printers.length}</div>
                  <p className="mt-2 text-sm text-[var(--muted)]">منصات طباعة مخصصة لأحجام وأنماط مختلفة</p>
                </div>
                <div className="border-b border-white/8 pb-4">
                  <div className="font-display text-3xl text-[color:var(--gold)]">{content.socials.length}</div>
                  <p className="mt-2 text-sm text-[var(--muted)]">قنوات جاهزة لاستقبال الطلبات والتواصل</p>
                </div>
                <div>
                  <div className="font-display text-3xl text-[color:var(--gold)]">2022</div>
                  <p className="mt-2 text-sm text-[var(--muted)]">بداية الرحلة التي تحولت من هواية إلى أسلوب عرض متكامل</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[color:var(--gold)]/12 bg-[linear-gradient(180deg,rgba(123,48,45,0.18),rgba(17,16,14,0.96))] p-6 shadow-2xl shadow-black/25">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                Curated Output
              </p>
              <p className="font-display mt-5 text-3xl leading-tight text-[var(--foreground)]">
                مجسمات تُعرض كقطع نهائية,
                <br />
                لا كنسخ خام فقط.
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                التركيز هنا على حضور العمل بصرياً: خامة أنظف، عرض أهدأ، وتفاصيل أقرب لواجهة استوديو منها إلى بورتفوليو تقليدي.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-4 lg:grid-cols-4">
          {content.printers.map((printer, index) => (
            <article
              key={printer.name}
              className="luxury-panel rounded-[26px] p-5 transition hover:-translate-y-1 hover:border-[color:var(--gold)]/25"
            >
              <div className="mb-4 h-px w-16 bg-[linear-gradient(90deg,var(--gold),transparent)]" />
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--subtle)]">
                Printer {index + 1}
              </div>
              <h2 className="font-display mt-3 text-2xl text-[var(--foreground)]">
                {printer.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{printer.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="luxury-panel rounded-[30px] p-7 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--subtle)]">Connect</p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">التواصل</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
              حضور موحد للأيقونات والروابط حتى تكون القنوات أوضح وأقرب لشكل التطبيقات الفعلي.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {content.socials.map((social) => {
              const iconSrc = social.iconSrc || socialIconFallbacks[social.key];

              return (
                <a
                  key={social.key}
                  href={social.href}
                  title={social.name}
                  aria-label={`${social.name} ${social.handle}`}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition hover:-translate-y-1 hover:border-[color:var(--gold)]/28 hover:bg-white/[0.06] sm:h-18 sm:w-18"
                >
                  <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg shadow-black/15 sm:h-12 sm:w-12">
                    <Image
                      src={iconSrc}
                      alt={social.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="sr-only">{social.handle}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="luxury-panel rounded-[30px] p-7 sm:p-9">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--subtle)]">About</p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">نبذة عني</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
              تعريف أكثر هدوءاً بالشخصية والخبرة بدل الصندوق التقليدي القديم.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {content.about.map((paragraph, index) => (
              <p
                key={paragraph}
                className={`text-sm leading-8 text-[var(--muted)] ${index === 0 ? "lg:pl-4" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {adminMode ? (
          <button
            type="button"
            title="تعديل الصفحة"
            aria-label="تعديل الصفحة"
            onClick={openEditModal}
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

      {showEditModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-white/10 bg-[#15151b] p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-black text-white">تعديل الصفحة الرئيسية</h2>
              <button
                type="button"
                title="إغلاق"
                aria-label="إغلاق"
                onClick={() => setShowEditModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">الشارة</span>
                <input
                  value={draft.badge}
                  onChange={(event) => setDraft({ ...draft, badge: event.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">رابط واتساب</span>
                <input
                  value={draft.whatsappUrl}
                  onChange={(event) => setDraft({ ...draft, whatsappUrl: event.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">العنوان الأول</span>
                <input
                  value={draft.titleLine1}
                  onChange={(event) => setDraft({ ...draft, titleLine1: event.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">العنوان الثاني</span>
                <input
                  value={draft.titleLine2}
                  onChange={(event) => setDraft({ ...draft, titleLine2: event.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#fb923c]/50"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-bold text-white/45">الوصف الرئيسي</span>
                <textarea
                  value={draft.subtitle}
                  onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#fb923c]/50"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-black text-white">الإحصائيات</h3>
                <div className="space-y-3">
                  {draft.stats.map((stat, index) => (
                    <div key={index} className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[100px_1fr]">
                      <input
                        value={stat.value}
                        onChange={(event) => {
                          const stats = [...draft.stats];
                          stats[index] = { ...stat, value: event.target.value };
                          setDraft({ ...draft, stats });
                        }}
                        className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                      />
                      <input
                        value={stat.label}
                        onChange={(event) => {
                          const stats = [...draft.stats];
                          stats[index] = { ...stat, label: event.target.value };
                          setDraft({ ...draft, stats });
                        }}
                        className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-black text-white">التواصل</h3>
                <div className="space-y-3">
                  {draft.socials.map((social, index) => (
                    <div key={social.key} className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-2">
                      <input
                        value={social.handle}
                        onChange={(event) => {
                          const socials = [...draft.socials];
                          socials[index] = { ...social, handle: event.target.value };
                          setDraft({ ...draft, socials });
                        }}
                        className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                      />
                      <input
                        value={social.href}
                        onChange={(event) => {
                          const socials = [...draft.socials];
                          socials[index] = { ...social, href: event.target.value };
                          setDraft({ ...draft, socials });
                        }}
                        className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#fb923c]/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-white">نبذة عني</span>
                <textarea
                  value={draft.about.join("\n\n")}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      about: event.target.value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean),
                    })
                  }
                  rows={7}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#fb923c]/50"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-white">الطابعات</span>
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
                  rows={7}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#fb923c]/50"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="h-11 rounded-lg border border-white/10 px-5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveContent}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-5 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ الصفحة"}
              </button>
            </div>
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

      <footer className="border-t border-white/10 px-5 py-7 text-center text-xs text-white/30">
        © 2026 Majed Almasmoum · 3D Printing Portfolio
      </footer>
    </main>
  );
}
