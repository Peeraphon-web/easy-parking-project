"use client";
// หน้า /admin/dashboard: ภาพรวมของลานที่เลือก
import Link from "next/link";
import FloorBadge, { levelClass } from "@/components/FloorBadge";
import PageHeader from "@/components/PageHeader";
import Plate from "@/components/Plate";
import Stat, { StatBar } from "@/components/Stat";
import { useLots } from "@/context/LotContext";
import { getSlotStatus, isHolding } from "@/lib/booking";
import { countByFloor, getLot, todayISO } from "@/lib/lots";
import { formatBaht, formatTime } from "@/lib/parking";
import { kioskPath } from "@/lib/routes";
import { useNow } from "@/lib/storage";

export default function DashboardPage() {
  const { lots, layouts, bookings, payments, adminLotId, cars: allCars } = useLots();
  const lot = getLot(adminLotId, lots);
  const now = useNow();
  if (!lot || !now) return <p className="text-muted">กำลังโหลด…</p>;

  const today = todayISO(now);
  const status = getSlotStatus(lot.id, layouts, bookings, now);
  const floors = countByFloor(lot, layouts, status);
  const free = floors.reduce((a, f) => a + f.free, 0);
  const total = floors.reduce((a, f) => a + f.total, 0);
  const cars = allCars.filter((c) => c.lotId === lot.id);
  const lotPays = payments.filter((p) => p.lotId === lot.id);
  // วันล่าสุดที่มีข้อมูล (Mock data อาจไม่มีวันนี้)
  const lastDay = lotPays[0]?.timeOut.slice(0, 10) ?? today;
  const dayPays = lotPays.filter((p) => p.timeOut.startsWith(lastDay));
  const upcoming = bookings.filter((b) => b.lotId === lot.id && isHolding(b, now));

  return (
    <>
      <PageHeader title="ภาพรวม" subtitle={lot.name}>
        {lot.exits.map((e) => (
          <Link key={e} href={kioskPath(lot.id, e)} className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-ink">เปิดตู้ Kiosk ทางออก {e}</Link>
        ))}
      </PageHeader>
      <StatBar>
        <Stat tone="paint" label="ช่องว่างตอนนี้" value={`${free} / ${total}`} note={`ใช้งาน ${Math.round(((total - free) / Math.max(1, total)) * 100)}%`} />
        <Stat label="รถในลานตอนนี้" value={cars.length} note="ยังไม่ได้จ่ายเงินออก" />
        <Stat tone="ok" label={`รายรับ ${lastDay}`} value={formatBaht(dayPays.reduce((a, p) => a + p.amount, 0))} note={`${dayPays.length} รายการ`} />
        <Stat label="การจองที่จะมาถึง" value={upcoming.length} note="ช่องที่กันไว้ตอนนี้" />
      </StatBar>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="grid content-start gap-4 rounded-lg bg-white shadow-card p-5">
          <h2 className="text-xl font-bold">ช่องว่างแยกตามชั้น</h2>
          <ul className="grid gap-4">
            {floors.map((f, i) => {
              const p = f.free / Math.max(1, f.total);
              const word = p > 0.3 ? "ว่างมาก" : p > 0 ? "ใกล้เต็ม" : "เต็ม";
              const tone = p > 0.3 ? "text-ok" : p > 0 ? "text-warn" : "text-bad";
              return (
                <li key={f.floor} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                  <FloorBadge floor={f.floor} index={i} size="md" />
                  <div className="grid gap-1.5">
                    <div className="flex justify-between text-sm"><span className="font-semibold">ชั้น {f.floor}</span><span className={tone}>{word}</span></div>
                    <div className="h-2.5 overflow-hidden rounded-[2px] bg-surface"><div className={`h-full ${levelClass(i)}`} style={{ width: `${p * 100}%` }} /></div>
                  </div>
                  <span className="num w-20 text-right font-display text-xl font-bold">{f.free}<span className="text-sm font-medium text-muted"> / {f.total}</span></span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="grid content-start gap-3 rounded-lg bg-white shadow-card p-5">
          <h2 className="text-xl font-bold">รถเข้าล่าสุด</h2>
          <table className="num w-full text-left text-sm">
            <thead className="text-muted"><tr className="border-b border-line"><th className="pb-2 font-medium">ทะเบียน</th><th className="pb-2 font-medium">รถ</th><th className="pb-2 font-medium">ช่อง</th><th className="pb-2 text-right font-medium">เวลาเข้า</th></tr></thead>
            <tbody>
              {[...cars].sort((a, b) => b.timeIn.localeCompare(a.timeIn)).slice(0, 6).map((c) => (
                <tr key={c.plate} className="border-b border-line last:border-0">
                  <td className="py-2"><Plate plate={c.plate} size="sm" /></td><td className="text-muted">{c.type}</td>
                  <td className="font-display font-semibold">{c.slot}</td><td className="text-right">{formatTime(c.timeIn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
