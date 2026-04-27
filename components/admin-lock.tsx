"use client";

import { useEffect, useState } from "react";
import { KeyRound, Lock, LogOut } from "lucide-react";
import { useAdmin } from "./admin-context";

export function AdminLock() {
  const {
    adminMode,
    showPasswordModal,
    openPasswordModal,
    closePasswordModal,
    signOut,
  } = useAdmin();

  function handleClick() {
    if (adminMode) {
      signOut();
      return;
    }
    openPasswordModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={adminMode ? "إيقاف وضع الإدارة" : "وضع الإدارة"}
        aria-label={adminMode ? "إيقاف وضع الإدارة" : "وضع الإدارة"}
        className={`fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-2xl shadow-black/40 backdrop-blur transition hover:scale-105 sm:h-14 sm:w-14 ${
          adminMode
            ? "border-[#fb923c]/55 bg-gradient-to-br from-[#fb923c]/35 to-[#f59e0b]/15 text-[#fb923c]"
            : "border-white/15 bg-[#1a1a24]/80 text-white/55 hover:border-white/30 hover:text-white"
        }`}
      >
        {adminMode ? <LogOut size={20} /> : <Lock size={20} />}
      </button>

      {showPasswordModal ? <PasswordModal onClose={closePasswordModal} /> : null}
    </>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const { passwordError, submitPassword } = useAdmin();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitPassword(password);
    if (!result.ok) setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-[#1d1d28] to-[#13131b] p-7 shadow-2xl shadow-black/50">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#fb923c]/35 bg-[#fb923c]/15 text-[#fb923c]">
          <KeyRound size={22} />
        </div>
        <h2 className="text-xl font-black text-white">وضع الإدارة</h2>
        <p className="mt-2 text-sm leading-7 text-white/45">
          أدخل كلمة المرور لتفعيل التعديل على المحتوى
        </p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmit();
          }}
          className="mt-5 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-[#fb923c]/55 focus:ring-4 focus:ring-[#fb923c]/15"
          placeholder="كلمة المرور"
          autoFocus
        />
        {passwordError ? (
          <p className="mt-2 text-xs text-red-300">{passwordError}</p>
        ) : null}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-white/10 px-5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-10 rounded-xl bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "جاري التحقق..." : "دخول"}
          </button>
        </div>
      </div>
    </div>
  );
}
