"use client";
// ห่อ Context ทุกตัวไว้ที่เดียว แล้ว app/layout.tsx เรียกใช้
import { AuthProvider } from "@/context/AuthContext";
import { LotProvider } from "@/context/LotContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LotProvider>{children}</LotProvider>
    </AuthProvider>
  );
}
