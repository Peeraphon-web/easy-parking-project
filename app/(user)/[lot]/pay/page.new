"use client";
// หน้า /[lot]/pay: ค้นทะเบียน → ดูค่าจอด → ThaiQR → ใบเสร็จ
// เปิดจาก QR ที่ติดในลาน หรือจากช่องค้นหา (/[lot]/pay?plate=กข1234)
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Plate from "@/components/Plate";
import QrMock from "@/components/QrMock";
import Icon from "@/components/Icon";
import { useLots } from "@/context/LotContext";
import { bookingFeeFor } from "@/lib/booking";
import { getLot } from "@/lib/lots";
import { calcFee, formatBaht, formatDate, formatDuration, formatTime, isValidPlate, minutesBetween, newRef, samePlate } from "@/lib/parking";
import { useNow } from "@/lib/storage";
import type { Car, Payment } from "@/types";

export default function PayPage() {
  const { lot: lotId } = useParams<{ lot: string }>();
  const search = useSearchParams();
  const { lots, setPayments, bookings, setBookings, cars, payments } = useLots();
  const lot = getLot(lotId, lots)!;
  const now = useNow(15000);

  const [query, setQuery] = useState(search.get("plate") ?? "");
  const [car, setCar] = useState<Car | null>(null);
  const [matches, setMatches] = useState<Car[]>([]);       // รถทุกคันที่ทะเบียนตรง (อาจซ้ำต่างจังหวัด)
  const fixKey = (c: Car) => `${c.lotId}|${c.plate}|${c.timeIn}`;
  const [error, setError] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  function find(q: string) {
    setCar(null); setMatches([]); setShowQr(false); setReceipt(null); setError("");
    if (!q.trim()) return setError("กรุณากรอกเลขทะเบียนก่อนค้นหา");
    if (!isValidPlate(q)) return setError("รูปแบบทะเบียนไม่ถูกต้อง ตัวอย่างที่ถูก: กข 1234 หรือ 7กพ 5521");
    if (!now) return;
    const found = cars.filter((c) => c.lotId === lot.id && samePlate(c.plate, q));
    if (!found.length) {
      const paid = payments.find((p) => p.lotId === lot.id && samePlate(p.plate, q) && now.getTime() - new Date(p.timeOut).getTime() < 15 * 60000);
      return setError(paid ? "รถคันนี้ชำระเงินแล้ว ขับออกได้ภายใน 15 นาที" : `ไม่พบรถทะเบียน ${q.trim()} ใน${lot.name} ตรวจสอบเลขทะเบียนอีกครั้ง`);
    }
    // ให้ผู้ใช้เลือกคันของตัวเองก่อนเสมอ (ทะเบียนเดียวกันอาจมีหลายจังหวัด)
    setMatches(found);
  }

  // ค้นหาอัตโนมัติเมื่อเปิดลิงก์ที่มี ?plate=
  useEffect(() => {
    if (now && cars.length && search.get("plate") && !car && !error && !receipt) find(search.get("plate")!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, cars.length]);

  const minutes = car && now ? minutesBetween(car.timeIn, now) : 0;
  const parkingFee = calcFee(minutes, lot.rates);
  const bookFee = car ? bookingFeeFor(lot, car.plate, bookings) : 0;
  const fee = parkingFee + bookFee;

  function confirmPaid() {
    if (!car || !now) return;
    const p: Payment = {
      ref: newRef(), lotId: lot.id, plate: car.plate, carType: car.type, slot: car.slot,
      timeIn: car.timeIn, timeOut: now.toISOString(), amount: fee, method: "ThaiQR", ...(bookFee ? { bookingFee: bookFee } : {}),
    };
    setPayments((prev) => [p, ...prev]);
    // รถที่มีการจองและเข้าจอดแล้ว → ปิดการจองเป็น "เสร็จสิ้น"
    setBookings((prev) => prev.map((b) => (b.lotId === lot.id && b.status === "checked_in" && samePlate(b.plate, car.plate) ? { ...b, status: "completed" } : b)));
    setReceipt(p); setShowQr(false);
  }

  // Rate panel (right column before searching): same style as the bill panel
  const rates = (
    <section className="grid gap-4 rounded-lg bg-asphalt p-5 text-white sm:p-6">
      <h2 className="text-xl font-bold">อัตราค่าจอด</h2>
      <dl className="num grid grid-cols-[1fr_auto] gap-y-3 [&>dd]:text-right [&>dd]:font-display [&>dd]:text-xl [&>dd]:font-bold">
        <dt className="text-white/80">{lot.rates.freeMinutes} นาทีแรก</dt><dd>ฟรี</dd>
        <dt className="text-white/80">ชั่วโมงละ</dt><dd>{lot.rates.perHour} บาท</dd>
        <dt className="text-white/80">เหมาสูงสุดต่อวัน</dt><dd>{lot.rates.dayMax} บาท</dd>
        <dt className="text-white/80">ค่าบริการจอง (ถ้าจอง)</dt><dd>{lot.rates.bookingFee} บาท</dd>
      </dl>
      <p className="border-t border-white/15 pt-3 text-sm text-white/80">เศษของชั่วโมงคิดเป็น 1 ชั่วโมง · จ่ายแล้วขับออกได้ภายใน 15 นาที</p>
    </section>
  );

  return (
    <div className="grid gap-6">
      <PageHeader title="ชำระค่าจอด" subtitle={`${lot.name} · ค้นหาด้วยเลขทะเบียน`} />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        {/* ===== Left: search + where the car is ===== */}
        <div className="grid gap-5">
          <div className="grid gap-2">
            <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); find(query); }}>
              <input id="pay-plate" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="เช่น กข 1234"
                className="h-14 min-w-0 flex-1 rounded-md border-2 border-ink bg-white px-4 font-display text-xl" aria-label="เลขทะเบียน" autoComplete="off" />
              <button className="flex h-14 items-center gap-2 rounded-md bg-paint px-6 font-display text-lg font-bold text-ink hover:bg-paint-hi"><Icon name="search" />ค้นหา</button>
            </form>
            <p className="text-sm text-muted">ลองค้นหา: กข 1234 (มี 2 คัน ต่างจังหวัด), 7กพ 5521, บต 889 (เซ็นทรัลเวิลด์) · จจ 1111 (พลัม คอนโด)</p>
          </div>

          {error && <p role="alert" className="rounded-md border border-bad/40 bg-bad/10 px-4 py-3 text-bad">{error}</p>}

          {/* ขั้นเลือกคันของตัวเอง */}
          {!car && matches.length > 0 && now && (
            <section className="grid gap-3" aria-labelledby="pick-title">
              <div>
                <h2 id="pick-title" className="text-xl font-bold">เลือกรถของคุณ</h2>
                <p className="text-sm text-muted">
                  {matches.length > 1
                    ? `พบทะเบียนนี้ ${matches.length} คันใน${lot.name} ดูจากจังหวัด สี และเวลาเข้า`
                    : "ตรวจว่าใช่รถของคุณ ก่อนดูค่าจอด"}
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {matches.map((m) => (
                  <li key={fixKey(m)}>
                    <button type="button" onClick={() => setCar(m)}
                      className="flex w-full items-center gap-4 rounded-lg bg-white p-4 text-left shadow-card hover:ring-2 hover:ring-ink focus-visible:ring-2 focus-visible:ring-ink">
                      <span className="grid h-16 w-20 shrink-0 place-items-center rounded-md text-xs text-white" style={{ background: m.color }}>{m.type}</span>
                      <span className="grid min-w-0 flex-1 gap-1">
                        <Plate plate={m.plate} province={m.province} size="md" />
                        <span className="num text-sm text-muted">เข้า {formatDate(m.timeIn)} {formatTime(m.timeIn)} · จอดมา {formatDuration(minutesBetween(m.timeIn, now))}</span>
                      </span>
                      <Icon name="arrow" className="h-5 w-5 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {car && now && !receipt && (
            <section className="grid gap-4 rounded-lg bg-white shadow-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="grid h-20 w-28 place-items-center rounded-md text-sm text-white" style={{ background: car.color }}>{car.type}</div>
                <div className="grid gap-1">
                  <Plate plate={car.plate} province={car.province} size="lg" />
                  <span className="num text-sm text-muted">เข้าลานเมื่อ <b className="text-ink">{formatDate(car.timeIn)} {formatTime(car.timeIn)}</b></span>
                </div>
                {matches.length > 1 && (
                  <button type="button" onClick={() => setCar(null)} className="ml-auto rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:border-ink">
                    ไม่ใช่คันนี้
                  </button>
                )}
              </div>
              {/* ภาพจากกล้องทางเข้า: มีกล้องแค่ที่ไม้กั้น จึงยืนยันตัวรถด้วยภาพตอนเข้า แทนการบอกช่องจอด */}
              <figure className="grid gap-2">
                <div className="relative grid h-48 place-items-center overflow-hidden rounded-md bg-asphalt">
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[repeating-linear-gradient(90deg,#3a3f46_0_40px,#2b2f35_40px_80px)]" />
                  <div className="relative grid justify-items-center gap-2">
                    <div className="h-20 w-44 rounded-t-[40px] rounded-b-md" style={{ background: car.color }} />
                    <div className="rounded-sm bg-white px-2 py-0.5 text-xs font-bold text-ink">{car.plate}</div>
                  </div>
                  <span className="num absolute left-3 top-3 rounded-sm bg-black/60 px-2 py-0.5 text-xs text-white">CAM-ENTRY · {formatDate(car.timeIn)} {formatTime(car.timeIn)}</span>
                </div>
                <figcaption className="text-sm text-muted">ภาพจากกล้องที่ไม้กั้นทางเข้า ตรวจสี รุ่น และป้ายว่าเป็นรถของคุณ</figcaption>
              </figure>
              <dl className="num grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-md bg-surface px-4 py-3 text-sm">
                <dt className="text-muted">จอดมาแล้ว</dt><dd className="font-semibold">{formatDuration(minutes)}</dd>
                <dt className="text-muted">ประเภทรถ</dt><dd className="font-semibold">{car.type}</dd>
                <dt className="text-muted">การจอง</dt><dd className="font-semibold">{bookFee ? `มีการจอง (ค่าบริการจอง ${formatBaht(bookFee)})` : "ไม่ได้จอง"}</dd>
              </dl>
            </section>
          )}

          {receipt && (
            <section role="status" className="grid gap-4 rounded-lg bg-white shadow-card ring-2 ring-ok/50 p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-ok">ชำระเงินสำเร็จ</h2>
              <dl className="num grid grid-cols-[1fr_auto] gap-y-2">
                <dt className="text-muted">เลขที่ใบเสร็จ</dt><dd className="text-right">{receipt.ref}</dd>
                <dt className="text-muted">ทะเบียน</dt><dd className="text-right">{receipt.plate}</dd>
                <dt className="text-muted">ยอดชำระ</dt><dd className="text-right font-display text-xl font-bold">{formatBaht(receipt.amount)}</dd>
              </dl>
              <p className="text-sm text-muted">ขับออกได้ภายใน 15 นาที ไม้กั้นทางออกจะเปิดอัตโนมัติเมื่ออ่านป้ายทะเบียน</p>
              <Link href={`/${lot.id}/history?plate=${encodeURIComponent(receipt.plate)}`} className="text-sm font-semibold underline">ดูใบเสร็จย้อนหลัง</Link>
            </section>
          )}

          {/* Before searching: the payment steps (a real sequence, so they are numbered) */}
          {!car && !receipt && matches.length === 0 && (
            <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {[
                ["กรอกเลขทะเบียน", "ไม่ต้องใส่ช่องว่างก็ได้ เช่น กข1234"],
                ["เลือกรถของคุณ", "ทะเบียนเดียวกันอาจมีหลายจังหวัด ดูสีและเวลาเข้า"],
                ["สแกน ThaiQR", "เปิดแอปธนาคารใดก็ได้ แล้วสแกนจ่าย"],
                ["ขับออกภายใน 15 นาที", "ไม้กั้นเปิดเองเมื่ออ่านป้ายทะเบียน"],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3 bg-white p-4">
                  <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-[4px] bg-asphalt font-display font-bold text-white">{i + 1}</span>
                  <span className="grid"><b className="font-display">{t}</b><span className="text-sm text-muted">{d}</span></span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* ===== Right: the bill (once a car is found) or the rates ===== */}
        <aside className="grid gap-4 lg:sticky lg:top-6">
          {car && now && !receipt ? (
            <section className="grid overflow-hidden rounded-lg bg-white shadow-card">
              <dl className="num grid grid-cols-[1fr_auto] gap-y-2 p-5">
                <dt className="text-muted">เวลาเข้า</dt><dd className="text-right">{formatDate(car.timeIn)} {formatTime(car.timeIn)}</dd>
                <dt className="text-muted">เวลาปัจจุบัน</dt><dd className="text-right">{formatTime(now)}</dd>
                <dt className="text-muted">ระยะเวลาจอด</dt><dd className="text-right">{formatDuration(minutes)}</dd>
                <dt className="text-muted">ค่าจอด</dt><dd className="text-right">{formatBaht(parkingFee)}</dd>
                {bookFee > 0 && <><dt className="text-muted">ค่าบริการจอง</dt><dd className="text-right">{formatBaht(bookFee)}</dd></>}
              </dl>
              <div className="grid gap-4 bg-asphalt p-5 text-white">
                <div>
                  <p className="text-sm text-white/80">ค่าจอดที่ต้องชำระ</p>
                  <p className="num font-display text-5xl font-bold leading-tight text-paint">{formatBaht(fee)}</p>
                </div>
                {!showQr && (
                  <button type="button" onClick={() => (fee === 0 ? confirmPaid() : setShowQr(true))}
                    className="h-14 rounded-md bg-paint font-display text-lg font-bold text-ink hover:bg-paint-hi">
                    {fee === 0 ? "ยืนยันออก (ฟรี)" : "ชำระด้วย ThaiQR"}
                  </button>
                )}
              </div>
              {showQr && (
                <div className="grid justify-items-center gap-3 bg-surface p-5">
                  <QrMock seed={car.plate + fee} />
                  <p className="text-center text-sm text-muted">เปิดแอปธนาคาร แล้วสแกนเพื่อจ่าย {formatBaht(fee)}</p>
                  <button type="button" onClick={confirmPaid} className="w-full rounded-md bg-paint px-6 py-3 font-display font-semibold text-ink hover:bg-paint-hi">
                    จำลองว่าชำระสำเร็จ
                  </button>
                </div>
              )}
            </section>
          ) : rates}
        </aside>
      </div>
    </div>
  );
}
