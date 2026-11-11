"use client";
// หน้า /[lot]/book: เลือกวันและเวลาก่อน → ผังแสดงช่องที่ว่างตลอดช่วงนั้น → เลือกช่อง → กรอกทะเบียน → จอง
// กติกาทั้งหมดอยู่ใน lib/booking.ts
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import FloorBadge from "@/components/FloorBadge";
import FloorMap, { FloorLegend } from "@/components/FloorMap";
import PageHeader from "@/components/PageHeader";
import { useLots } from "@/context/LotContext";
import { RULES, bookingEnd, bookingStart, getAvailability, openRange, validateBooking } from "@/lib/booking";
import { getCell, getLayout, getLot, todayISO } from "@/lib/lots";
import { formatDate, formatTime, isValidPlate } from "@/lib/parking";
import { useNow } from "@/lib/storage";
import type { Booking } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

// เวลามาถึงที่เลือกได้: ทุก 30 นาที ภายในเวลาเปิด และก่อนปิดอย่างน้อย 1 ชม.
function timeOptions(open: [number, number] | null) {
  const [from, to] = open ? [open[0], open[1] - RULES.lastBookBeforeCloseMin + 1] : [0, 24 * 60];
  const list: string[] = [];
  for (let m = from; m < to; m += 30) list.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return list;
}

export default function BookPage() {
  const { lot: lotId } = useParams<{ lot: string }>();
  const { lots, layouts, bookings, setBookings } = useLots();
  const lot = getLot(lotId, lots)!;
  const now = useNow();
  const open = openRange(lot);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [floor, setFloor] = useState(lot.floors[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [plate, setPlate] = useState("");
  const [special, setSpecial] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Booking | null>(null);

  // ค่าเริ่มต้น: เวลาที่จองได้เร็วที่สุด (ปัดขึ้นเป็นครึ่งชั่วโมง + 30 นาที)
  useEffect(() => {
    if (!now || date) return;
    const t = new Date(now.getTime() + (RULES.minLeadMinutes + 30) * 60000);
    t.setMinutes(t.getMinutes() < 30 ? 30 : 60, 0, 0);
    let mins = t.getHours() * 60 + t.getMinutes();
    if (open && mins < open[0]) mins = open[0];
    if (open && mins > open[1] - RULES.lastBookBeforeCloseMin) { t.setDate(t.getDate() + 1); mins = open[0]; }
    setDate(todayISO(t));
    setTime(`${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`);
  }, [now, date, open]);

  if (!now || !date) return <p className="text-muted">กำลังโหลด…</p>;

  const minDate = todayISO(now);
  const maxDate = todayISO(new Date(now.getTime() + RULES.maxDaysAhead * 86400000));
  const draft = { lotId: lot.id, plate: plate.trim(), slot: slot ?? "", date, time };
  const start = bookingStart(draft);
  const status = getAvailability(lot.id, layouts, bookings, start, bookingEnd(draft), now);
  const layout = getLayout(lot.id, floor, layouts);
  const freeCount = Object.values(status).filter((s) => s === "free").length;
  const kind = slot ? getCell(layouts, lot.id, slot)?.cell.kind ?? "normal" : "normal";
  const needsConfirm = kind === "ev" || kind === "disabled";

  function changeWindow(fn: () => void) { fn(); setSlot(null); setError(""); setDone(null); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return setError("กรุณาเลือกช่องจอดจากผัง");
    if (!isValidPlate(plate)) return setError("รูปแบบทะเบียนไม่ถูกต้อง ตัวอย่าง: กข 1234");
    if (needsConfirm && !special) return setError(kind === "ev" ? "ช่องนี้สำหรับรถไฟฟ้า กรุณายืนยันว่าเป็นรถไฟฟ้า" : "ช่องนี้สำหรับผู้พิการ กรุณายืนยันสิทธิ์");
    const err = validateBooking(draft, lot, layouts, bookings, now!);
    if (err) return setError(err);
    const b: Booking = { ...draft, id: `BK-${Date.now().toString().slice(-6)}`, status: "confirmed", createdAt: now!.toISOString() };
    setBookings((prev) => [...prev, b]);
    setDone(b); setSlot(null); setError(""); setSpecial(false);
  }

  const field = "h-12 rounded-md border border-ink/40 bg-white px-3 text-base";

  return (
    <div className="grid gap-6">
      <PageHeader title="จองที่จอดล่วงหน้า" subtitle={`${lot.name} · เปิด ${lot.openHours}`} />

      {/* ขั้นที่ 1: เลือกช่วงเวลา */}
      <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-bold"><span className="grid h-7 w-7 place-items-center rounded-[4px] bg-asphalt text-sm text-paint">1</span>จะมาถึงเมื่อไหร่</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">วันที่
            <input id="book-date" type="date" min={minDate} max={maxDate} value={date} onChange={(e) => changeWindow(() => setDate(e.target.value))} className={field} />
          </label>
          <label className="grid gap-1 text-sm">เวลาที่จะมาถึง
            <select id="book-time" value={time} onChange={(e) => changeWindow(() => setTime(e.target.value))} className={field}>
              {timeOptions(open).map((t) => <option key={t} value={t}>{t} น.</option>)}
            </select>
          </label>
        </div>
        <p className="num text-sm text-muted">
          มาถึง {formatDate(start)} {formatTime(start)} น. · ไม่ต้องระบุเวลาออก ค่าจอดคิดตามเวลาจริง · มีช่องให้เลือก <b className="text-ink">{freeCount}</b> ช่อง
        </p>
      </section>

      {/* ขั้นที่ 2: เลือกช่อง + ขั้นที่ 3: กรอกทะเบียน */}
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-bold"><span className="grid h-7 w-7 place-items-center rounded-[4px] bg-asphalt text-sm text-paint">2</span>เลือกช่องที่ว่าง</h2>
            <div className="flex flex-wrap gap-1.5">
              {lot.floors.map((f) => (
                <button key={f} type="button" onClick={() => { setFloor(f); setSlot(null); }} aria-pressed={f === floor}
                  className={`flex items-center gap-2 rounded-md py-1 pl-1 pr-3 text-sm font-semibold ${f === floor ? "bg-asphalt text-white" : "border border-line bg-white hover:border-ink"}`}>
                  <FloorBadge floor={f} index={lot.floors.indexOf(f)} size="xs" />ชั้น {f}
                </button>
              ))}
            </div>
          </div>
          <FloorLegend />
          {layout ? <div key={floor} className="deck-in"><FloorMap layout={layout} mode="select" status={status} selected={slot} onCellClick={(_, __, c) => { if (c?.code) { setSlot(c.code); setError(""); setSpecial(false); } }} /></div>
            : <p className="text-muted">ชั้นนี้ยังไม่มีผัง</p>}
          <p className="text-sm text-muted">
            {start.getTime() - now.getTime() < RULES.nearHours * 3600000
              ? "จองภายใน 2 ชั่วโมงข้างหน้า: ช่องที่มีรถจอดอยู่ตอนนี้นับว่าไม่ว่าง เพราะรถอาจยังไม่ออก"
              : "จองล่วงหน้าเกิน 2 ชั่วโมง: ช่องที่ไม่ว่างคือช่องที่มีคนจองทับช่วงเวลานี้"}
          </p>
        </section>

        <form onSubmit={submit} className="grid gap-3 rounded-lg bg-white shadow-card p-5">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold"><span className="grid h-7 w-7 place-items-center rounded-[4px] bg-asphalt text-sm text-paint">3</span>ยืนยันการจอง</h2>
          <dl className="num grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted">ช่อง</dt><dd className="font-semibold">{slot ?? "ยังไม่ได้เลือก"}{kind !== "normal" && slot ? (kind === "ev" ? " · ช่องรถไฟฟ้า" : kind === "disabled" ? " · ช่องผู้พิการ" : " · ช่องมอเตอร์ไซค์") : ""}</dd>
            <dt className="text-muted">มาถึง</dt><dd>{formatDate(start)} {formatTime(start)} น.</dd>
            <dt className="text-muted">ค่าบริการจอง</dt><dd>{lot.rates.bookingFee ?? 0} บาท <span className="text-muted">(จ่ายรวมกับค่าจอดตอนออก)</span></dd>
          </dl>
          <label className="grid gap-1 text-sm">เลขทะเบียน
            <input id="book-plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="กข 1234" className={field} />
          </label>
          {needsConfirm && (
            <label className="flex items-start gap-2 text-sm">
              <input id="book-special" type="checkbox" checked={special} onChange={(e) => setSpecial(e.target.checked)} className="mt-1" />
              {kind === "ev" ? "รถของฉันเป็นรถไฟฟ้า (EV)" : "ฉันมีสิทธิ์จอดช่องผู้พิการ"}
            </label>
          )}
          {error && <p role="alert" className="rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>}
          <button className="h-13 rounded-md bg-paint px-5 py-3 font-display text-lg font-bold text-ink hover:bg-paint-hi">ยืนยันการจอง</button>
          <ul className="grid list-disc gap-1 border-t border-line pt-3 pl-4 text-sm text-muted">
            <li>ช่องจะถูกกันไว้ตั้งแต่ {RULES.holdBeforeMin} นาทีก่อนเวลาเข้า</li>
            <li>ถ้าไม่มาภายใน {RULES.graceAfterMin} นาทีหลังเวลาเข้า ระบบจะปล่อยช่องให้ผู้อื่น</li>
            <li>ถ้าช่องที่จองมีรถอื่นจอดอยู่ ระบบจะย้ายให้เป็นช่องประเภทเดียวกัน ชั้นเดียวกันก่อน</li>
            <li>ค่าจอดคิดตามเวลาจอดจริง + ค่าบริการจอง {lot.rates.bookingFee ?? 0} บาท จ่ายรวมกันตอนออก</li>
            <li>ยกเลิกก่อนเวลามาถึงได้ ไม่มีค่าใช้จ่าย</li>
          </ul>
        </form>
      </div>

      {done && (
        <section role="status" className="grid gap-2 rounded-lg bg-white shadow-card ring-2 ring-ok/50 p-5">
          <h2 className="text-2xl font-bold text-ok">จองสำเร็จ</h2>
          <p>รหัสการจอง <b className="num rounded-lg bg-paint-soft px-2 py-0.5 font-display text-2xl text-paint-ink">{done.id}</b></p>
          <p className="num text-sm text-muted">ช่อง {done.slot} · มาถึง {formatDate(bookingStart(done))} {done.time} น. · ทะเบียน {done.plate} · ค่าบริการจอง {lot.rates.bookingFee ?? 0} บาท</p>
          <p className="text-sm">เก็บรหัสนี้ไว้ ใช้คู่กับเลขทะเบียนเพื่อดู เลื่อนเวลา หรือยกเลิกการจอง</p>
          <Link href={`/${lot.id}/history?plate=${encodeURIComponent(done.plate)}&code=${done.id}`} className="text-sm text-paint-ink underline">จัดการการจองนี้</Link>
        </section>
      )}
    </div>
  );
}
