"use client";
// หน้า /kiosk/[lot]/[exit]: ตู้ชำระเงินที่ช่องทางออก หน้าไม้กั้น (เต็มจอ ไม่มี Navbar)
// ขั้นตอน: สแกนป้าย → ยืนยันรถ → ดูค่าจอด → จ่าย → ไม้กั้นเปิด
// กล้องเปิดจริงผ่าน getUserMedia แต่ "ผลการอ่านป้าย" เป็นการจำลอง (ระบบจริงต้องใช้ LPR ฝั่ง Back End)
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Plate from "@/components/Plate";
import QrMock from "@/components/QrMock";
import { useLots } from "@/context/LotContext";
import { bookingFeeFor } from "@/lib/booking";
import { getLot } from "@/lib/lots";
import { calcFee, formatBaht, formatDuration, formatTime, minutesBetween, newRef, normalizePlate, samePlate } from "@/lib/parking";
import { useNow } from "@/lib/storage";
import type { Car, PayMethod } from "@/types";

type Step = "start" | "scan" | "type" | "confirm" | "fee" | "pay" | "done";
const RAIL = ["สแกน", "ยืนยัน", "ค่าจอด", "ชำระ"];
const RAIL_INDEX: Record<Step, number> = { start: -1, scan: 0, type: 0, confirm: 1, fee: 2, pay: 3, done: 4 };
const TH_KEYS = "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ".split("");
const IDLE_MS = 45000;
const SCAN_MS = 3000;

function Kiosk() {
  const { lot: lotId, exit } = useParams<{ lot: string; exit: string }>();
  const { lots, setPayments, bookings, setBookings, cars: allCars } = useLots();
  const lot = getLot(lotId, lots);
  const now = useNow(1000);

  const [step, setStep] = useState<Step>("start");
  const [car, setCar] = useState<Car | null>(null);
  const [conf, setConf] = useState(0);
  const [typed, setTyped] = useState("");
  const [method, setMethod] = useState<PayMethod>("ThaiQR");
  const [ref, setRef] = useState("");
  const [left, setLeft] = useState(15);
  const [camOn, setCamOn] = useState(false);
  const scanCount = useRef(0);
  const video = useRef<HTMLVideoElement>(null);

  const cars = lot ? allCars.filter((c) => c.lotId === lot.id) : [];
  const reset = () => { setStep("start"); setCar(null); setTyped(""); setRef(""); };

  // ไม่มีคนแตะ 45 วินาที → กลับหน้าแรก
  useEffect(() => {
    if (step === "start" || step === "done") return;
    const t = setTimeout(reset, IDLE_MS);
    return () => clearTimeout(t);
  }, [step, typed]);

  // ขั้นสแกน: เปิดกล้อง + จำลองว่าอ่านป้ายได้หลัง 3 วินาที
  useEffect(() => {
    if (step !== "scan") return;
    let stream: MediaStream | undefined;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => { stream = s; setCamOn(true); if (video.current) video.current.srcObject = s; })
      .catch(() => setCamOn(false));
    const t = setTimeout(() => {
      if (!cars.length) { setStep("type"); return; }
      setCar(cars[scanCount.current++ % cars.length]);
      setConf(90 + Math.floor(Math.random() * 9));
      setStep("confirm");
    }, SCAN_MS);
    return () => { clearTimeout(t); stream?.getTracks().forEach((tr) => tr.stop()); setCamOn(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // หน้าสำเร็จ: นับถอยหลัง 15 วินาที
  useEffect(() => {
    if (step !== "done") return;
    setLeft(15);
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);
  useEffect(() => {
    if (step === "done" && left === 0) reset();
  }, [step, left]);

  if (!lot) return <p className="p-8 text-white">ไม่พบสถานที่ {lotId}</p>;

  const minutes = car && now ? minutesBetween(car.timeIn, now) : 0;
  const parkingFee = calcFee(minutes, lot.rates);
  const bookFee = car ? bookingFeeFor(lot, car.plate, bookings) : 0;
  const fee = parkingFee + bookFee;
  const matches = typed ? cars.filter((c) => normalizePlate(c.plate).includes(normalizePlate(typed))) : [];
  const cur = RAIL_INDEX[step];

  function pay(m: PayMethod = method) {
    if (!car || !now) return;
    const r = newRef();
    setPayments((prev) => [{ ref: r, lotId: lot!.id, plate: car.plate, carType: car.type, slot: car.slot, timeIn: car.timeIn, timeOut: now.toISOString(), amount: fee, method: m, ...(bookFee ? { bookingFee: bookFee } : {}) }, ...prev]);
    setBookings((prev) => prev.map((b) => (b.lotId === lot!.id && b.status === "checked_in" && samePlate(b.plate, car.plate) ? { ...b, status: "completed" } : b)));
    setRef(r); setStep("done");
  }

  const btn = "min-h-16 rounded-md px-5 font-display text-lg font-semibold";
  const ghost = `${btn} border-2 border-white/25 text-white`;
  const primary = `${btn} bg-paint text-ink`;

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-asphalt-deep text-white">
      {/* ป้ายทางออก */}
      <div className="flex flex-wrap items-center gap-3 bg-paint px-4 py-2.5 text-ink">
        <span className="h-7 w-14 rounded" style={{ background: "repeating-linear-gradient(-45deg,#1a1b1e 0 8px,#f2c230 8px 16px)" }} />
        <b className="font-display text-2xl">ทางออก {exit}</b>
        <span className="mr-auto text-sm"><span className="font-display tracking-[.2em]">EXIT {exit}</span> · {lot.name}</span>
        <span className={`flex items-center gap-2 rounded-full bg-asphalt-deep px-3 py-1.5 font-display text-sm ${step === "done" ? "text-paint" : "text-bad-lt"}`}>
          <i className="h-2.5 w-2.5 rounded-full bg-current" />ไม้กั้น{step === "done" ? "เปิด" : "ปิด"}
        </span>
        {step === "start"
          ? <Link href={`/${lot.id}`} className="rounded-lg border-2 border-ink px-3 py-1.5 font-display text-sm">ออกจากโหมดตู้</Link>
          : <button type="button" onClick={reset} className="rounded-lg border-2 border-ink px-3 py-1.5 font-display text-sm">ยกเลิก</button>}
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-[1.45fr_1fr] md:p-4">
        {/* ซ้าย: กล้อง หรือ แป้นพิมพ์ */}
        <div className="grid min-w-0 grid-rows-[1fr_auto] gap-3">
          {step === "type" ? (
            <div className="grid content-center gap-2 rounded-lg border border-white/15 bg-asphalt p-3">
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-11">
                {TH_KEYS.map((k) => (
                  <button key={k} type="button" onClick={() => typed.length < 9 && setTyped(typed + k)} className="min-h-12 rounded-lg bg-asphalt-2 font-display text-xl active:bg-asphalt-3">{k}</button>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
                {"1234567890".split("").map((k) => (
                  <button key={k} type="button" onClick={() => typed.length < 9 && setTyped(typed + k)} className="min-h-12 rounded-lg bg-asphalt-2 font-display text-xl">{k}</button>
                ))}
                <button type="button" onClick={() => setTyped(typed.slice(0, -1))} className="col-span-2 min-h-12 rounded-lg bg-bad/40 font-display">ลบ</button>
              </div>
            </div>
          ) : (
            <div className="relative min-h-64 overflow-hidden rounded-lg border border-white/15 bg-black/25">
              {camOn && <video ref={video} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />}
              {!camOn && (
                <div className="absolute inset-0 grid place-items-center">
                  {car && step !== "scan" ? (
                    <div className="grid justify-items-center gap-3">
                      <div className="grid h-28 w-44 place-items-center rounded-lg text-sm text-white" style={{ background: car.color }}>{car.type}</div>
                      <div className="rounded-md ring-4 ring-paint"><Plate plate={car.plate} size="lg" /></div>
                    </div>
                  ) : (
                    <p className="text-white/70">{step === "scan" ? "กำลังค้นหาป้ายทะเบียน…" : "หยุดรถที่เส้นขาว"}</p>
                  )}
                </div>
              )}
              <div className="absolute left-3 right-3 top-2 flex justify-between font-mono text-xs text-white/70">
                <span className="flex items-center gap-1.5 text-white"><i className="h-2 w-2 rounded-full bg-bad-lt" style={{ animation: "blink 1.2s infinite" }} />CAM EXIT-{exit}</span>
                <span className="num">{now?.toLocaleTimeString("th-TH")}</span>
              </div>
              <div className="absolute inset-x-[28%] bottom-[18%] h-[20%] rounded-lg border-4 border-paint/70" />
              {step === "scan" && <div className="absolute inset-x-0 h-0.5 bg-paint" style={{ animation: "scan-sweep 1.5s ease-in-out infinite alternate" }} />}
            </div>
          )}

          {/* แถบผลการอ่าน */}
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-white/15 bg-asphalt sm:grid-cols-[1.6fr_1fr_1fr_1fr]">
            {[
              ["ทะเบียน", step === "type" ? typed || "—" : car && step !== "scan" ? car.plate : step === "scan" ? "กำลังอ่าน…" : "—"],
              ["จังหวัด", car && step !== "scan" && step !== "type" ? car.province : "—"],
              ["ความแม่นยำ", step === "type" ? "พิมพ์เอง" : car && step !== "scan" ? `${conf}%` : "—"],
              ["เวลาเข้า", car && step !== "scan" && step !== "type" ? formatTime(car.timeIn) : "—"],
            ].map(([k, v], i) => (
              <div key={k} className={`grid min-w-0 gap-0.5 border-white/15 px-4 py-2.5 ${i ? "border-l" : ""}`}>
                <span className="text-sm text-white/70">{k}</span>
                <b className={`truncate font-display ${i === 0 ? "text-3xl text-paint" : "text-base"}`}>{v}</b>
              </div>
            ))}
          </div>
        </div>

        {/* ขวา: แผงทำรายการ */}
        <div className="grid min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-white/15 bg-asphalt">
          <ol className="grid grid-cols-4 border-b border-white/15 text-sm">
            {RAIL.map((s, i) => (
              <li key={s} className={`flex items-center justify-center gap-1.5 px-1 py-3 font-display ${i ? "border-l border-white/15" : ""} ${i === cur ? "bg-paint font-semibold text-ink" : i < cur ? "text-paint" : "text-white/70"}`}>
                <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-xs">{i + 1}</span>{s}
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-4 p-5">
            {step === "start" && (
              <>
                <h1 className="mt-auto text-4xl font-bold leading-tight">หยุดรถที่เส้นขาว แล้วแตะเพื่อชำระเงิน</h1>
                <dl className="num grid grid-cols-[1fr_auto] text-2xl [&>*]:border-b [&>*]:border-white/15 [&>*]:py-4">
                  <dt>{lot.rates.freeMinutes} นาทีแรก</dt><dd className="font-semibold text-paint">ฟรี</dd>
                  <dt>ชั่วโมงละ</dt><dd className="font-semibold text-paint">{lot.rates.perHour} บาท</dd>
                  <dt>สูงสุดต่อวัน</dt><dd className="font-semibold text-paint">{lot.rates.dayMax} บาท</dd>
                </dl>
                <button type="button" onClick={() => setStep("scan")} className={`${primary} mt-2 min-h-20 text-2xl`}>เริ่มสแกนป้าย</button>
              </>
            )}

            {step === "scan" && (
              <>
                <h1 className="text-3xl">กำลังอ่านป้ายทะเบียน</h1>
                <ul className="grid gap-2 text-lg">
                  {["หยุดรถให้ป้ายหน้าอยู่ในกรอบ", "ปิดไฟสูง", "ไม่ต้องลงจากรถ"].map((t) => <li key={t} className="rounded-lg bg-asphalt-2 px-4 py-2.5">{t}</li>)}
                </ul>
                <button type="button" onClick={() => setStep("type")} className={`${ghost} mt-auto`}>พิมพ์ทะเบียนเอง</button>
              </>
            )}

            {step === "type" && (
              <>
                <h1 className="text-3xl">{matches.length ? "แตะเลือกรถของคุณ" : "พิมพ์ทะเบียนด้วยแป้นด้านซ้าย"}</h1>
                <div className="grid gap-2">
                  {typed && !matches.length && <p className="text-white/70">ไม่พบ “{typed}” ในลานจอด</p>}
                  {matches.map((c) => (
                    <button key={c.plate} type="button" onClick={() => { setCar(c); setConf(100); setStep("fee"); }}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/20 bg-asphalt-2 px-4 py-3 text-left hover:border-paint">
                      <b className="font-display text-2xl text-paint">{c.plate}</b>
                      <span className="text-sm text-white/70">{c.type} · เข้า {formatTime(c.timeIn)}</span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setStep("scan")} className={`${ghost} mt-auto`}>สแกนด้วยกล้อง</button>
              </>
            )}

            {step === "confirm" && car && (
              <>
                <h1 className="text-3xl">ทะเบียนนี้ใช่รถของคุณไหม?</h1>
                <Plate plate={car.plate} province={car.province} size="lg" />
                <p className="text-white/70">{car.type} · จอดช่อง {car.slot}</p>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setStep("scan")} className={ghost}>ไม่ใช่ สแกนใหม่</button>
                  <button type="button" onClick={() => setStep("fee")} className={primary}>ใช่ ไปต่อ</button>
                </div>
              </>
            )}

            {step === "fee" && car && now && (
              <>
                <h1 className="text-3xl">ค่าจอดของคุณ</h1>
                <dl className="num grid grid-cols-[1fr_auto] gap-y-2 rounded-md bg-surface px-4 py-3 text-ink">
                  <dt className="text-muted">เข้า</dt><dd className="font-semibold">{formatTime(car.timeIn)}</dd>
                  <dt className="text-muted">ออก</dt><dd className="font-semibold">{formatTime(now)}</dd>
                  <dt className="text-muted">จอด</dt><dd className="font-semibold">{formatDuration(minutes)}</dd>
                  <dt className="text-muted">ค่าจอด</dt><dd className="font-semibold">{formatBaht(parkingFee)}</dd>
                  {bookFee > 0 && <><dt className="text-muted">ค่าบริการจอง</dt><dd className="font-semibold">{formatBaht(bookFee)}</dd></>}
                  <dt className="self-end border-t border-dashed border-line pt-2 text-muted">ยอดชำระ</dt>
                  <dd className="border-t border-dashed border-line pt-2 font-display text-3xl font-bold">{formatBaht(fee)}</dd>
                </dl>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  {(["ThaiQR", "Cash"] as PayMethod[]).map((m) => (
                    <button key={m} type="button" onClick={() => { setMethod(m); if (fee === 0) pay(m); else setStep("pay"); }}
                      className="grid min-h-20 content-center rounded-md border-2 border-asphalt-3 bg-asphalt-2 px-4 text-left hover:border-paint">
                      <b className="font-display text-xl">{m === "ThaiQR" ? "ThaiQR" : "เงินสด"}</b>
                      <small className="text-white/70">{m === "ThaiQR" ? "สแกนด้วยแอปธนาคาร" : "ใส่ที่ช่องด้านล่าง"}</small>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "pay" && car && (
              <>
                <h1 className="text-3xl">{method === "ThaiQR" ? "สแกนจ่าย" : "ใส่เงิน"} <span className="num">{formatBaht(fee)}</span></h1>
                {method === "ThaiQR" ? <QrMock seed={car.plate + fee} size={180} /> : (
                  <p className="rounded-lg bg-asphalt-2 px-4 py-3">รับธนบัตร 20 · 50 · 100 · 500 และเหรียญ · ทอนเงินอัตโนมัติ</p>
                )}
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setStep("fee")} className={ghost}>เปลี่ยนวิธี</button>
                  <button type="button" onClick={() => pay()} className={primary}>{method === "ThaiQR" ? "จำลองว่าจ่ายแล้ว" : "จำลองว่าใส่ครบ"}</button>
                </div>
              </>
            )}

            {step === "done" && car && (
              <>
                <h1 className="text-3xl">ไม้กั้นเปิดแล้ว ขับออกได้เลย</h1>
                <svg viewBox="0 -160 300 300" className="w-56 self-center" role="img" aria-label="ไม้กั้นยกขึ้น">
                  <rect x="0" y="128" width="300" height="10" rx="3" fill="#3a3d42" />
                  <rect x="24" y="62" width="36" height="68" rx="6" fill="#f2c230" />
                  <circle cx="42" cy="80" r="6" fill="#86d9a6" />
                  <g style={{ transformBox: "view-box", transformOrigin: "42px 80px", animation: "gate-up 1.1s .2s ease-out both" }}>
                    <rect x="42" y="72" width="230" height="16" rx="8" fill="#f1f1ee" />
                    <rect x="82" y="72" width="30" height="16" fill="#e24d4d" /><rect x="152" y="72" width="30" height="16" fill="#e24d4d" /><rect x="222" y="72" width="30" height="16" fill="#e24d4d" />
                  </g>
                </svg>
                <dl className="num grid grid-cols-[1fr_auto] gap-y-1 rounded-md bg-surface px-4 py-3 text-ink">
                  <dt className="text-muted">ใบเสร็จ</dt><dd className="font-semibold">{ref}</dd>
                  <dt className="text-muted">ชำระ</dt><dd className="font-display text-2xl font-bold">{formatBaht(fee)}</dd>
                </dl>
                <p className="text-sm text-white/70">กลับหน้าแรกใน <span className="num">{left}</span> วินาที</p>
                <button type="button" onClick={reset} className={`${primary} mt-auto`}>เสร็จสิ้น</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-white/15 px-4 py-2.5 text-sm text-white/70">
        <span className="mr-auto">Easy Parking · {lot.name}</span>
        <span className="num">โทรเรียกเจ้าหน้าที่ {lot.phone}</span>
        <button type="button" className="rounded-lg border-2 border-paint px-3 py-1.5 font-display text-paint">เรียกเจ้าหน้าที่</button>
      </div>
    </div>
  );
}

export default function KioskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-asphalt-deep" />}>
      <Kiosk />
    </Suspense>
  );
}
