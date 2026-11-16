"use client";
// Driver-side menu: an asphalt sidebar with a yellow paint rule on its right (same build as the admin sidebar).
// On a phone: logo bar on top, and the menu becomes 4 equal tabs fixed to the bottom of the screen.
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getLot } from "@/lib/lots";
import { userNav } from "@/lib/routes";
import { useLots } from "@/context/LotContext";
import Icon from "./Icon";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold tracking-tight ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-[4px] bg-paint text-base leading-none text-ink">P</span>
      Easy Parking
    </span>
  );
}

const NAV_ICON = ["pin", "qr", "calendar", "receipt"] as const;

export default function Navbar() {
  const pathname = usePathname();
  const params = useParams<{ lot?: string }>();
  const { lots } = useLots();
  const lot = getLot(params.lot, lots);

  const link = (active: boolean) =>
    `flex flex-col items-center gap-1 whitespace-nowrap rounded-md px-1 py-2 text-xs transition-colors md:flex-row md:gap-2.5 md:px-3 md:text-[15px] ${active ? "bg-paint font-semibold text-ink" : "text-white/85 hover:bg-white/10 hover:text-white"}`;

  return (
    <aside className="z-20 flex flex-col gap-4 border-b-4 border-paint bg-asphalt px-4 py-3 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:gap-5 md:border-b-0 md:border-r-4 md:p-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-xl"><Wordmark /></Link>
      </div>

      {lot && (
        <Link href="/" title="เปลี่ยนสถานที่" className="group hidden gap-0.5 rounded-md bg-asphalt-2 px-3 py-2.5 md:grid">
          <span className="text-xs text-white/65">สถานที่</span>
          <b className="font-display leading-snug">{lot.name}</b>
          <span className="text-xs text-white/65 underline-offset-2 group-hover:text-white group-hover:underline">เปลี่ยนสถานที่</span>
        </Link>
      )}

      {/* มือถือ: แถบแท็บติดขอบล่างจอ (fixed) · คอม: รายการแนวตั้งใน sidebar */}
      <nav className={`${lot ? "grid grid-cols-4" : "flex"} fixed inset-x-0 bottom-0 z-30 gap-1 border-t-4 border-paint bg-asphalt px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:static md:flex md:flex-col md:border-0 md:bg-transparent md:p-0`} aria-label="เมนูหลัก">
        {lot ? (
          userNav(lot.id).map((item, i) => {
            const active = item.href === `/${lot.id}` ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={link(active)} aria-current={active ? "page" : undefined}>
                <Icon name={NAV_ICON[i] ?? "arrow"} className="h-[18px] w-[18px] shrink-0" />{item.label}
              </Link>
            );
          })
        ) : (
          <span className="px-3 py-2 text-[15px] text-white/75">เลือกสถานที่เพื่อเริ่มใช้งาน</span>
        )}
      </nav>

      <div className="mt-auto hidden gap-3 border-t border-white/15 pt-4 text-sm md:grid">
        {lot && (
          <a href={`tel:${lot.phone}`} className="flex items-center gap-2 px-3 text-white/85 hover:text-white">
            <Icon name="phone" className="h-4 w-4" />
            <span>ติดต่อเจ้าหน้าที่ <b className="num font-display">{lot.phone}</b></span>
          </a>
        )}
      </div>
    </aside>
  );
}
