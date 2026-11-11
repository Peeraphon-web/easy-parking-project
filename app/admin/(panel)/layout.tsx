"use client";
// Layout ฝั่งผู้ดูแล: ต้องล็อกอินก่อน + Sidebar + กันหน้าที่ไม่มีสิทธิ์
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_MENU } from "@/lib/routes";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, ready, can } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !admin) router.replace("/admin/login");
  }, [ready, admin, router]);

  if (!ready || !admin) return <p className="p-8 text-muted">กำลังตรวจสอบการเข้าสู่ระบบ…</p>;

  const item = ADMIN_MENU.find((m) => pathname.startsWith(m.href));
  const allowed = !item || (item.superOnly ? admin.role === "super" : can(item.key));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:px-8 md:py-6 xl:px-10">
        <div className="mx-auto grid max-w-[96rem] gap-6">
          {allowed ? <Suspense fallback={<p className="text-muted">กำลังโหลด…</p>}>{children}</Suspense>
            : <p className="rounded-md bg-bad/10 px-4 py-3 text-bad">บัญชีนี้ไม่มีสิทธิ์เข้าหน้านี้ ติดต่อผู้ดูแลส่วนกลาง</p>}
        </div>
      </main>
    </div>
  );
}
