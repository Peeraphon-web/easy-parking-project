"use client";
// Page /: choose a location
import Link from "next/link";
import FloorBadge from "@/components/FloorBadge";
import Icon from "@/components/Icon";
import { useLots } from "@/context/LotContext";
import { getSlotStatus } from "@/lib/booking";
import { countByFloor } from "@/lib/lots";
import { useNow } from "@/lib/storage";

export default function SelectLotPage() {
  const { lots, layouts, bookings } = useLots();
  const now = useNow();

  return (
    <div className="grid gap-10">
      <section className="-mx-4 -mt-6 grid gap-10 bg-asphalt px-4 py-10 text-white sm:mx-0 sm:mt-0 sm:rounded-lg sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="grid gap-4">
          <h1 className="text-4xl font-bold leading-[1.2] sm:text-5xl">
            <span className="block">จอดที่ไหน จ่ายที่นั่น</span>
            <span className="block">ในเว็บเดียว</span>
          </h1>
          <p className="max-w-[48ch] text-lg text-white/80">
            เลือกสถานที่ที่คุณจอดอยู่ เพื่อดูช่องว่าง ชำระค่าจอด หรือจองล่วงหน้า ไม่ต้องสมัครสมาชิก
          </p>
        </div>
        <ol className="hidden gap-px overflow-hidden rounded-md bg-white/15 sm:grid">
          {[
            { icon: "qr" as const, t: "สแกน QR ที่เสา หรือเลือกสถานที่ด้านล่าง" },
            { icon: "search" as const, t: "ดูช่องว่างแต่ละชั้น หรือค้นหารถจากทะเบียน" },
            { icon: "ticket" as const, t: "จ่ายด้วย ThaiQR แล้วขับออกได้ภายใน 15 นาที" },
          ].map((s, i) => (
            <li key={s.t} className="flex items-center gap-4 bg-asphalt-2 px-4 py-3.5">
              <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-[4px] bg-paint font-display font-bold text-ink">{i + 1}</span>
              <span className="flex-1 text-[15px] text-white/90">{s.t}</span>
              <Icon name={s.icon} className="h-5 w-5 text-white/60" />
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4" aria-labelledby="lots-title">
        <h2 id="lots-title" className="text-2xl font-bold">สถานที่ในระบบ <span className="num text-muted">({lots.length})</span></h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {lots.map((lot) => {
            const status = now ? getSlotStatus(lot.id, layouts, bookings, now) : {};
            const floors = countByFloor(lot, layouts, status);
            const free = floors.reduce((a, f) => a + f.free, 0);
            const total = floors.reduce((a, f) => a + f.total, 0);
            return (
              <li key={lot.id}>
                <Link href={`/${lot.id}`}
                  className="group grid h-full gap-5 rounded-lg bg-white p-6 shadow-card hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold">{lot.name}</h3>
                      <p className="mt-0.5 text-sm text-muted">{lot.address}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num font-display text-4xl font-bold leading-none">{now ? free : "–"}</p>
                      <p className="num mt-1 text-sm text-muted">ว่าง จาก {total} ช่อง</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {floors.map((f, i) => (
                      <span key={f.floor} className="flex items-center gap-1.5 rounded-[5px] bg-surface py-1 pl-1 pr-2.5">
                        <FloorBadge floor={f.floor} index={i} size="xs" />
                        <span className="num text-sm font-semibold">{now ? f.free : "–"}<span className="font-normal text-muted"> / {f.total}</span></span>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-line pt-4 text-sm text-muted">
                    <span className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4" />{lot.openHours}</span>
                      <span className="num">ชั่วโมงละ {lot.rates.perHour} บาท</span>
                    </span>
                    <span className="flex items-center gap-1 font-display font-semibold text-ink">
                      เข้าลานนี้<Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
