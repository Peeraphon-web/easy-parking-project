"use client";
// หน้า /admin/door: Door Parking — กล้องทางออก (จำลอง) ทะเบียนที่อ่านได้ เวลาเข้า-ออก ค่าจอด
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Plate from "@/components/Plate";
import { useLots } from "@/context/LotContext";
import { STATUS_TH, assignOnArrival, bookingFeeFor, bookingStart, resolveStatus } from "@/lib/booking";
import { getLot } from "@/lib/lots";
import { calcFee, formatBaht, formatDate, formatDuration, formatTime, minutesBetween } from "@/lib/parking";
import { useNow } from "@/lib/storage";

export default function DoorPage() {
  const { lots, layouts, bookings, setBookings, adminLotId, cars: allCars } = useLots();
  const lot = getLot(adminLotId, lots);
  const now = useNow(5000);
  const [index, setIndex] = useState(0);
  const [exit, setExit] = useState(0);
  const [arrival, setArrival] = useState<{ ok: boolean; text: string } | null>(null);
  if (!lot || !now) return <p className="text-muted">กำลังโหลด…</p>;

  const cars = allCars.filter((c) => c.lotId === lot.id);
  const car = cars.length ? cars[index % cars.length] : null;
  const minutes = car ? minutesBetween(car.timeIn, now) : 0;
  const lotBookings = bookings
    .filter((b) => b.lotId === lot.id && ["confirmed", "checked_in"].includes(resolveStatus(b, now)))
    .sort((a, b) => bookingStart(a).getTime() - bookingStart(b).getTime());

  // จำลองว่ารถที่จองไว้มาถึงทางเข้า: กล้องอ่านทะเบียน → เจอการจอง → เช็กเซนเซอร์ช่องที่จอง
  function simulateArrival(id: string) {
    const b = bookings.find((x) => x.id === id);
    if (!b || !now) return;
    const result = assignOnArrival(b, layouts, bookings, now);
    if (!result) {
      setArrival({ ok: false, text: `${b.plate}: ช่อง ${b.slot} มีรถจอดอยู่ และไม่มีช่องประเภทเดียวกันว่าง แจ้งเจ้าหน้าที่ช่วยหาที่จอด` });
      return;
    }
    setBookings((prev) => prev.map((x) => (x.id === id
      ? { ...x, status: "checked_in", slot: result.slot, ...(result.moved ? { originalSlot: x.slot } : {}) }
      : x)));
    setArrival(result.moved
      ? { ok: true, text: `${b.plate}: ช่อง ${b.slot} มีรถอื่นจอดทับอยู่ → ระบบย้ายไปช่อง ${result.slot} และแสดงที่ป้ายทางเข้าแล้ว` }
      : { ok: true, text: `${b.plate}: ช่อง ${b.slot} ว่าง → ป้ายทางเข้าแสดง "ช่องของคุณ ${b.slot}"` });
  }

  return (
    <>
      <PageHeader title="Door Parking" subtitle={`${lot.name} · ทางออก ${lot.exits[exit % lot.exits.length]}`}>
        {lot.exits.length > 1 && <button type="button" onClick={() => setExit(exit + 1)} className="rounded-md border border-line bg-white px-3 py-2 text-sm">สลับประตู</button>}
        <button type="button" onClick={() => setIndex(index + 1)} className="rounded-md bg-paint hover:bg-paint-hi px-4 py-2 text-sm font-semibold text-ink">จำลองรถคันถัดไป</button>
      </PageHeader>

      {car ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative aspect-video max-w-full overflow-hidden rounded-lg bg-asphalt-deep">
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid justify-items-center gap-3">
                <div className="grid h-28 w-44 place-items-center rounded-lg text-sm text-white" style={{ background: car.color }}>{car.type}</div>
                <div className="rounded-md ring-4 ring-paint"><Plate plate={car.plate} size="lg" /></div>
              </div>
            </div>
            <span className="absolute left-3 top-2 flex items-center gap-1.5 font-mono text-xs text-white">
              <i className="h-2 w-2 rounded-full bg-[#f05555]" style={{ animation: "blink 1.2s infinite" }} />CAM-EXIT (จำลอง)
            </span>
            <span className="num absolute right-3 top-2 font-mono text-xs text-white/70">{now.toLocaleTimeString("th-TH")}</span>
          </div>
          <div className="grid content-start gap-4 rounded-lg bg-white shadow-card p-5">
            <div>
              <p className="text-xs text-muted">ทะเบียนที่อ่านได้ · ความแม่นยำ 97%</p>
              <Plate plate={car.plate} province={car.province} size="lg" />
            </div>
            <dl className="num grid grid-cols-[1fr_auto] gap-y-2">
              <dt className="text-muted">เวลาเข้า</dt><dd>{formatTime(car.timeIn)}</dd>
              <dt className="text-muted">เวลาออก</dt><dd>{formatTime(now)}</dd>
              <dt className="text-muted">เวลาจอดทั้งหมด</dt><dd>{formatDuration(minutes)}</dd>
            </dl>
            <div>
              <p className="text-xs text-muted">ค่าจอด{bookingFeeFor(lot, car.plate, bookings) ? ` (รวมค่าบริการจอง ${lot.rates.bookingFee ?? 0} บาท)` : ""}</p>
              <p className="num font-display text-4xl font-bold text-ink">{formatBaht(calcFee(minutes, lot.rates) + bookingFeeFor(lot, car.plate, bookings))}</p>
            </div>
          </div>
        </div>
      ) : <p className="text-muted">ไม่มีรถในลานนี้</p>}

      <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
        <div>
          <h2 className="text-xl font-bold">รถที่จองไว้ (ทางเข้า)</h2>
          <p className="text-sm text-muted">ระบบจริงจะทำเองเมื่อกล้องทางเข้าอ่านทะเบียนได้ตรงกับการจอง ตั้งแต่ 15 นาทีก่อนถึง 15 นาทีหลังเวลาจอง ปุ่มด้านล่างใช้จำลองเหตุการณ์นี้</p>
        </div>
        {arrival && <p className={`rounded-md px-3 py-2 text-sm ${arrival.ok ? "bg-paint-soft text-paint-ink" : "bg-bad/10 text-bad"}`}>{arrival.text}</p>}
        {lotBookings.length === 0 ? <p className="text-muted">ไม่มีการจองที่รออยู่</p> : (
          <div className="overflow-x-auto">
            <table className="num w-full text-left text-sm">
              <thead className="text-muted"><tr><th className="py-2">รหัส</th><th>ทะเบียน</th><th>ช่อง</th><th>เวลา</th><th>สถานะ</th><th /></tr></thead>
              <tbody>
                {lotBookings.map((b) => {
                  const st = resolveStatus(b, now);
                  return (
                    <tr key={b.id} className="border-t border-line">
                      <td className="py-2.5">{b.id}</td><td className="font-semibold">{b.plate}</td>
                      <td>{b.slot}{b.originalSlot && <span className="text-xs text-warn"> (เดิม {b.originalSlot})</span>}</td>
                      <td>{formatDate(bookingStart(b))} {b.time}</td><td>{STATUS_TH[st]}</td>
                      <td className="text-right">
                        {st === "confirmed" && <button type="button" onClick={() => simulateArrival(b.id)} className="rounded-lg border border-line px-2 py-1 text-xs">จำลองรถเข้ามา</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg bg-white shadow-card p-5">
        <h2 className="mb-3 text-lg text-ink">รถที่อยู่ในลาน ({cars.length})</h2>
        <div className="overflow-x-auto">
          <table className="num w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="py-2">ทะเบียน</th><th>ประเภท</th><th>ช่อง</th><th>เวลาเข้า</th><th className="text-right">ค่าจอดสะสม</th></tr></thead>
            <tbody>
              {cars.map((c) => (
                <tr key={c.plate} className="border-t border-line">
                  <td className="py-2.5 font-semibold">{c.plate}</td><td>{c.type}</td><td>{c.slot}</td><td>{formatTime(c.timeIn)}</td>
                  <td className="text-right">{formatBaht(calcFee(minutesBetween(c.timeIn, now), lot.rates))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
