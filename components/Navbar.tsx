"use client";
// Driver-side menu: an asphalt sidebar with a yellow paint rule on its right (same build as the admin sidebar).
// On a phone it folds into a top bar with a scrolling menu row.
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
    `flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-[15px] transition-colors ${active ? "bg-paint font-semibold text-ink" : "text-white/85 hover:bg-white/10 hover:text-white"}`;

  return (
    <aside className="z-20 flex flex-col gap-4 border-b-4 border-paint bg-asphalt px-4 py-3 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:gap-5 md:border-b-0 md:border-r-4 md:p-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-xl"><Wordmark /></Link>
        <Link href="/admin/login" className="ml-auto whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-white/85 ring-1 ring-inset ring-white/25 hover:bg-white/10 md:hidden">
          ผู้ดูแลระบบ
        </Link>
      </div>

      {lot && (
        <Link href="/" title="เปลี่ยนสถานที่" className="group hidden gap-0.5 rounded-md bg-asphalt-2 px-3 py-2.5 md:grid">
          <span className="text-xs text-white/65">สถานที่</span>
          <b className="font-display leading-snug">{lot.name}</b>
          <span className="text-xs text-white/65 underline-offset-2 group-hover:text-white group-hover:underline">เปลี่ยนสถานที่</span>
        </Link>
      )}

      <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_88%,transparent)] md:mx-0 md:flex-col md:px-0 md:[mask-image:none]" aria-label="เมนูหลัก">
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
        <Link href="/admin/login" className="flex items-center justify-center rounded-md px-3 py-2 text-white/85 ring-1 ring-inset ring-white/25 hover:bg-white/10">
          ผู้ดูแลระบบ
        </Link>
      </div>
    </aside>
  );
}
