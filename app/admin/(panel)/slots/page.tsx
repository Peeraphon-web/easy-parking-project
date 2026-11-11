"use client";
// หน้า /admin/slots: สถานะช่องจอดทุกชั้นของลานที่เลือก
import { useState } from "react";
import FloorBadge from "@/components/FloorBadge";
import FloorMap, { FloorLegend } from "@/components/FloorMap";
import PageHeader from "@/components/PageHeader";
import { useLots } from "@/context/LotContext";
import { getSlotStatus } from "@/lib/booking";
import { countByFloor, getLayout, getLot } from "@/lib/lots";
import { useNow } from "@/lib/storage";

export default function SlotsPage() {
  const { lots, layouts, bookings, adminLotId } = useLots();
  const lot = getLot(adminLotId, lots);
  const now = useNow();
  const [floor, setFloor] = useState<string | null>(null);
  if (!lot || !now) return <p className="text-muted">กำลังโหลด…</p>;

  const current = floor && lot.floors.includes(floor) ? floor : lot.floors[0];
  const status = getSlotStatus(lot.id, layouts, bookings, now);
  const floors = countByFloor(lot, layouts, status);
  const layout = getLayout(lot.id, current, layouts);

  return (
    <>
      <PageHeader title="สถานะช่องจอด" subtitle={lot.name} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-3 text-xl font-bold"><FloorBadge floor={current} index={lot.floors.indexOf(current)} size="md" />ผังชั้น {current}</h2>
            <FloorLegend />
          </div>
          {layout ? <FloorMap layout={layout} status={status} /> : <p className="text-muted">ชั้นนี้ยังไม่มีผัง ไปที่เมนู “ออกแบบผัง”</p>}
        </section>
        <section className="grid gap-2 rounded-lg bg-white shadow-card p-5">
          <h2 className="text-xl font-bold">ทุกชั้น</h2>
          <p className="text-sm text-muted">คลิกชั้นเพื่อดูผัง</p>
          <ul className="grid gap-1.5">
            {floors.map((f, i) => {
              const used = Math.round(((f.total - f.free) / Math.max(1, f.total)) * 100);
              const on = f.floor === current;
              return (
                <li key={f.floor}>
                  <button type="button" onClick={() => setFloor(f.floor)} aria-pressed={on}
                    className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md px-2 py-2 text-left ${on ? "bg-asphalt text-white" : "hover:bg-surface"}`}>
                    <FloorBadge floor={f.floor} index={i} size="sm" />
                    <span className="num text-sm">
                      <b className="font-display text-base">ว่าง {f.free}</b> / {f.total}
                      <span className={`block text-xs ${on ? "text-white/75" : "text-muted"}`}>มีรถหรือจอง {f.total - f.free} ช่อง</span>
                    </span>
                    <span className="num font-display text-lg font-bold">{used}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
