"use client";
// Admin sidebar: filtered by permission (role + menus)
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_MENU } from "@/lib/routes";
import Icon from "./Icon";
import LotSwitcher from "./LotSwitcher";
import { Wordmark } from "./Navbar";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, can, logout } = useAuth();
  const menu = ADMIN_MENU.filter((m) => (m.superOnly ? admin?.role === "super" : can(m.key)));

  return (
    <aside className="flex flex-col gap-5 border-b-4 border-paint bg-asphalt p-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r-4">
      <Link href="/admin/dashboard" className="grid gap-0.5">
        <Wordmark className="text-xl" />
        <small className="pl-9 text-xs text-white/65">ผู้ดูแลระบบ</small>
      </Link>
      <LotSwitcher />
      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 md:flex-col" aria-label="เมนูผู้ดูแล">
        {menu.map((m) => {
          const active = pathname.startsWith(m.href);
          return (
            <Link key={m.key} href={m.href} aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-[15px] transition-colors ${active ? "bg-paint font-semibold text-ink" : "text-white/85 hover:bg-white/10"}`}>
              {m.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden gap-2 border-t border-white/15 pt-4 text-sm md:grid">
        <span className="text-white/90">{admin?.name}</span>
        <span className="text-xs text-white/65">{admin?.role === "super" ? "Super Admin · ทุกสถานที่" : "ผู้ดูแลลาน"}</span>
        <button type="button" onClick={() => { logout(); router.push("/admin/login"); }}
          className="mt-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-white/85 ring-1 ring-inset ring-white/25 hover:bg-white/10">
          <Icon name="logout" className="h-4 w-4" />ออกจากระบบ
        </button>
      </div>
      <button type="button" onClick={() => { logout(); router.push("/admin/login"); }}
        className="flex items-center gap-2 self-start text-sm text-white/75 hover:text-white md:hidden">
        <Icon name="logout" className="h-4 w-4" />ออกจากระบบ ({admin?.name})
      </button>
    </aside>
  );
}
