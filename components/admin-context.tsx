"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type VerifyResult = {
  ok: boolean;
  error?: string;
};

type AdminContextValue = {
  adminMode: boolean;
  adminPassword: string;
  showPasswordModal: boolean;
  passwordError: string | null;
  openPasswordModal: () => void;
  closePasswordModal: () => void;
  submitPassword: (password: string) => Promise<VerifyResult>;
  signOut: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

async function verifyPassword(password: string): Promise<VerifyResult> {
  try {
    const response = await fetch("/api/verify-password", {
      method: "POST",
      headers: { "x-admin-password": password },
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.error || "كلمة المرور غير صحيحة" };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "تعذر التحقق",
    };
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminPw") || "";
    if (!stored) return;
    verifyPassword(stored).then((result) => {
      if (result.ok) {
        setAdminPassword(stored);
        setAdminMode(true);
      } else {
        sessionStorage.removeItem("adminPw");
      }
    });
  }, []);

  const openPasswordModal = useCallback(() => {
    setPasswordError(null);
    setShowPasswordModal(true);
  }, []);

  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setPasswordError(null);
  }, []);

  const signOut = useCallback(() => {
    setAdminMode(false);
    setAdminPassword("");
    sessionStorage.removeItem("adminPw");
  }, []);

  const submitPassword = useCallback(async (password: string) => {
    const trimmed = password.trim();
    if (!trimmed) {
      const result = { ok: false, error: "أدخل كلمة المرور" } as const;
      setPasswordError(result.error);
      return result;
    }

    const result = await verifyPassword(trimmed);
    if (!result.ok) {
      setPasswordError(result.error || "كلمة المرور غير صحيحة");
      return result;
    }

    sessionStorage.setItem("adminPw", trimmed);
    setAdminPassword(trimmed);
    setAdminMode(true);
    setShowPasswordModal(false);
    setPasswordError(null);
    return result;
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      adminMode,
      adminPassword,
      showPasswordModal,
      passwordError,
      openPasswordModal,
      closePasswordModal,
      submitPassword,
      signOut,
    }),
    [
      adminMode,
      adminPassword,
      showPasswordModal,
      passwordError,
      openPasswordModal,
      closePasswordModal,
      submitPassword,
      signOut,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
