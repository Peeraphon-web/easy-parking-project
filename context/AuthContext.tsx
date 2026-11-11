"use client";
// ===== ผู้ดูแลที่ล็อกอินอยู่ (เก็บใน localStorage) =====
import { createContext, useContext, useEffect, useState } from "react";
import { ADMINS } from "@/lib/lots";
import { load, remove, save } from "@/lib/storage";
import type { Admin, MenuKey } from "@/types";

type AuthValue = {
  admin: Admin | null;
  admins: Admin[];
  ready: boolean;                          // โหลดจาก localStorage เสร็จหรือยัง
  login: (username: string, password: string) => boolean;
  logout: () => void;
  can: (menu: MenuKey) => boolean;
  saveAdmins: (list: Admin[]) => void;     // ใช้ในหน้าสิทธิ์ผู้ใช้
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admins, setAdmins] = useState<Admin[]>(ADMINS);
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAdmins(load("admins", ADMINS));
    setUsername(load<string | null>("auth", null));
    setReady(true);
  }, []);

  const admin = admins.find((a) => a.username === username) ?? null;

  const value: AuthValue = {
    admin,
    admins,
    ready,
    login(u, p) {
      const found = admins.find((a) => a.username === u.trim() && a.password === p);
      if (!found) return false;
      setUsername(found.username);
      save("auth", found.username);
      return true;
    },
    logout() {
      setUsername(null);
      remove("auth");
    },
    can(menu) {
      if (!admin) return false;
      return admin.role === "super" || admin.menus.includes(menu);
    },
    saveAdmins(list) {
      setAdmins(list);
      save("admins", list);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ต้องอยู่ใน <AuthProvider>");
  return ctx;
}
