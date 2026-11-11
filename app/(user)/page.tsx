"use client";
// Page /: choose a location
// Hero แบบภาพใหญ่มีมุมบาก + การ์ดสถานที่แบบมีรูป (แรงบันดาลใจจาก landing page ธุรกิจที่จอดรถ)
import Link from "next/link";
import FloorBadge from "@/components/FloorBadge";
import Icon from "@/components/Icon";
import ParkingPhoto from "@/components/ParkingPhoto";
import { useLots } from "@/context/LotContext";
import { getSlotStatus } from "@/lib/booking";
import { countByFloor } from "@/lib/lots";
import { useNow } from "@/lib/storage";

export default function SelectLotPage() {
  const { lots, layouts, bookings } = useLots();
  const now = useNow();

  const summary = lots.map((lot) => {
    const status = now ? getSlotStatus(lot.id, layouts, bookings, now) : {};
    const floors = countByFloor(lot, layouts, status);
    return { lot, floors, free: floors.reduce((a, f) => a + f.free, 0), total: floors.reduce((a, f) => a + f.total, 0) };
  });

  return (
    <div className="grid gap-12">
      {/* ---------- Hero ---------- */}
      <section className="grid items-center gap-8 lg:grid-cols-[5fr_7fr]">
        <div className="grid gap-6">
          <p className="font-display text-sm font-semibold tracking-[0.2em] text-paint-ink">EASY PARKING</p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
            <span className="block">จอดที่ไหน</span>
            <span className="block">จ่ายที่นั่น.</span>
          </h1>
          <p className="max-w-[42ch] text-lg text-muted">
            ดูช่องว่างแต่ละชั้น ชำระค่าจอดด้วย ThaiQR หรือจองล่วงหน้า ในเว็บเดียวทุกสถานที่ ไม่ต้องสมัครสมาชิก
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#lots" className="rounded-full bg-paint px-6 py-3 font-display font-semibold text-ink hover:bg-paint-hi">
              เลือกสถานที่
            </a>
            <Link href="/admin/login" className="rounded-full border border-ink/25 bg-white px-6 py-3 font-display font-semibold hover:border-ink">
              สำหรับผู้ดูแล
            </Link>
          </div>
        </div>

        {/* ภาพใหญ่ + มุมบากซ้ายบน (ใส่ตัวเลขช่องว่างรวมไว้ในรอยบาก) */}
        <div className="relative h-[300px] sm:h-[420px]">
          {/* ภาพประกอบลานจอด (public/images/hero.png พื้นโปร่งใส) วางบนพื้นสีอ่อน */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-white"
            style={{ backgroundImage: "radial-gradient(ellipse at 60% 55%, #fbefc4, transparent 65%)" }}>
            <div className="absolute inset-x-[6%] inset-y-[4%] sm:left-[18%]">
              <ParkingPhoto src="/images/hero.png" alt="ภาพประกอบลานจอดรถมีต้นไม้และรถจอดอยู่" fit="contain" scene="mall" />
            </div>
          </div>
          <div className="absolute left-0 top-0 rounded-br-[2rem] bg-surface pb-3 pr-3">
            <div className="grid gap-0.5 rounded-[1.25rem] bg-white px-5 py-3 shadow-card">
              <span className="text-xs text-muted">ไม่ต้องสมัครสมาชิก</span>
              <span className="font-display text-2xl font-bold leading-tight">สแกน · จ่าย · ออก</span>
            </div>
            {/* มุมโค้งกลับด้าน 2 จุด (ขวาและล่างของรอยบาก) ให้รอยบากต่อกับภาพแบบเนียน */}
            <span aria-hidden="true" className="absolute left-full top-0 h-8 w-8" style={{ background: "radial-gradient(circle at 100% 100%, transparent 2rem, var(--color-surface) 2rem)" }} />
            <span aria-hidden="true" className="absolute left-0 top-full h-8 w-8" style={{ background: "radial-gradient(circle at 100% 100%, transparent 2rem, var(--color-surface) 2rem)" }} />
          </div>
        </div>
      </section>

      {/* ---------- สถานที่ ---------- */}
      <section id="lots" className="grid scroll-mt-6 gap-5" aria-labelledby="lots-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="lots-title" className="font-display text-3xl font-bold">สถานที่ในระบบ <span className="num text-muted">({lots.length})</span></h2>
          <p className="text-sm text-muted">หรือสแกน QR ที่เสาในลานจอดเพื่อเข้าหน้านั้นทันที</p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {summary.map(({ lot, floors, free, total }, i) => (
            <li key={lot.id}>
              <Link href={`/${lot.id}`}
                className="group grid h-full gap-3 rounded-[1.75rem] bg-white p-3 shadow-card transition hover:bg-paint focus-visible:outline-3 focus-visible:outline-ink">
                <div className="relative h-52 overflow-hidden rounded-[1.25rem]">
                  <ParkingPhoto key={lot.image ? "upload" : "default"} src={lot.image || `/images/lots/${lot.id}.jpg`} alt={`ลานจอด ${lot.name}`} scene={lot.scene} variant={i} className="transition duration-500 group-hover:scale-105" />
                  <span className="num absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold">
                    ว่าง {now ? free : "–"} / {total}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-2 pb-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-bold">{lot.name}</h3>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted group-hover:text-ink/75">
                      <span className="flex items-center gap-1"><Icon name="clock" className="h-4 w-4" />{lot.openHours}</span>
                      <span className="flex gap-1">{floors.map((f, k) => <FloorBadge key={f.floor} floor={f.floor} index={k} size="xs" />)}</span>
                    </p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface transition group-hover:bg-ink group-hover:text-white">
                    <Icon name="arrow" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- วิธีใช้ ---------- */}
      <section className="grid gap-px overflow-hidden rounded-[1.75rem] bg-line sm:grid-cols-3" aria-label="วิธีใช้งาน">
        {[
          { icon: "qr" as const, t: "สแกน QR ที่เสา", d: "หรือเลือกสถานที่จากรายการด้านบน" },
          { icon: "search" as const, t: "ค้นหารถจากทะเบียน", d: "ดูเวลาจอด ค่าจอด และช่องที่จอด" },
          { icon: "ticket" as const, t: "จ่ายด้วย ThaiQR", d: "แล้วขับออกได้ภายใน 15 นาที" },
        ].map((s, i) => (
          <div key={s.t} className="flex items-start gap-4 bg-white p-6">
            <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paint font-display font-bold text-ink">{i + 1}</span>
            <div className="grid gap-0.5">
              <span className="flex items-center gap-2 font-display font-semibold">{s.t}<Icon name={s.icon} className="h-4 w-4 text-muted" /></span>
              <span className="text-sm text-muted">{s.d}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
