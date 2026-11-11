"use client";
// หน้า /[lot]/history
// · ใบเสร็จ: ค้นด้วยทะเบียน
// · การจอง: ต้องกรอกทะเบียน + รหัสการจองให้ตรงกัน ถึงจะเลื่อนหรือยกเลิกได้ (กันคนอื่นมายกเลิกแทน)
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useLots } from "@/context/LotContext";
import { RULES, STATUS_TH, arrivalTimeOptions, bookingStart, canChangeTime, planReschedule, resolveStatus } from "@/lib/booking";
import { getLot, todayISO } from "@/lib/lots";
import { formatBaht, formatDate, formatTime, samePlate } from "@/lib/parking";
import { useNow } from "@/lib/storage";
import type { Booking } from "@/types";

const BADGE: Record<string, string> = {
  confirmed: "bg-paint-soft text-paint-ink",
  checked_in: "bg-asphalt/10 text-ink",
  completed: "bg-line text-muted",
  cancelled: "bg-line text-muted",
  no_show: "bg-bad/10 text-bad",
};

export default function HistoryPage() {
  const { lot: lotId } = useParams<{ lot: string }>();
  const search = useSearchParams();
  const { lots, layouts, bookings, setBookings, payments } = useLots();
  const lot = getLot(lotId, lots)!;
  const now = useNow();

  const [plateIn, setPlateIn] = useState(search.get("plate") ?? "");
  const [codeIn, setCodeIn] = useState(search.get("code") ?? "");
  const [plate, setPlate] = useState(search.get("plate") ?? "");
  const [code, setCode] = useState(search.get("code") ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [proposal, setProposal] = useState<{ slot: string } | null>(null);

  const booking = plate && code
    ? bookings.find((b) => b.lotId === lot.id && b.id.toUpperCase() === code.trim().toUpperCase() && samePlate(b.plate, plate))
    : undefined;
  const myPayments = plate ? payments.filter((p) => p.lotId === lot.id && samePlate(p.plate, plate)).slice(0, 20) : [];

  function update(id: string, change: Partial<Booking>) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...change } : b)));
  }

  function startEdit(b: Booking) {
    setEditing(true); setProposal(null); setMsg(null);
    setNewDate(b.date); setNewTime(b.time);
  }

  // ตรวจเวลาใหม่: ช่องเดิมว่าง → บันทึกเลย · ไม่ว่าง → เสนอช่องอื่นให้กดยืนยัน
  function checkNewTime(b: Booking) {
    if (!now) return;
    setProposal(null);
    if (newDate === b.date && newTime === b.time) return setMsg({ ok: false, text: "เลือกเวลาใหม่ที่ต่างจากเดิม" });
    const plan = planReschedule(b, newDate, newTime, lot, layouts, bookings, now);
    if (!plan.ok) return setMsg({ ok: false, text: plan.error });
    if (plan.moved) {
      setProposal({ slot: plan.slot });
      return setMsg({ ok: false, text: `ช่อง ${b.slot} ไม่ว่างในเวลาใหม่ มีช่องประเภทเดียวกันว่างคือ ${plan.slot} ต้องการเปลี่ยนไหม` });
    }
    saveChange(b, b.slot);
  }

  function saveChange(b: Booking, slot: string) {
    update(b.id, { date: newDate, time: newTime, slot, changes: (b.changes ?? 0) + 1 });
    setEditing(false); setProposal(null);
    const left = RULES.maxChanges - (b.changes ?? 0) - 1;
    setMsg({ ok: true, text: `เปลี่ยนเวลามาถึงเป็น ${formatDate(new Date(`${newDate}T${newTime}:00`))} ${newTime} น. ช่อง ${slot} แล้ว (เปลี่ยนได้อีก ${left} ครั้ง)` });
  }

  const status = booking && now ? resolveStatus(booking, now) : null;
  const changeBlock = booking && now ? canChangeTime(booking, now) : "…";
  const field = "h-13 min-w-0 rounded-md border-2 border-ink/80 bg-white px-4 text-base";

  return (
    <div className="grid gap-6">
      <PageHeader title="การจองและประวัติ" subtitle={`${lot.name} · ไม่ต้องสมัครสมาชิก`} />
      <form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); setPlate(plateIn.trim()); setCode(codeIn.trim()); setMsg(null); }}>
        <input id="hist-plate" value={plateIn} onChange={(e) => setPlateIn(e.target.value)} placeholder="ทะเบียน เช่น กข 1234" className={field} aria-label="เลขทะเบียน" />
        <input id="hist-code" value={codeIn} onChange={(e) => setCodeIn(e.target.value)} placeholder="รหัสการจอง เช่น BK-1042 (ถ้ามี)" className={field} aria-label="รหัสการจอง" />
        <button className="h-13 rounded-md bg-paint px-6 font-display text-lg font-bold text-ink hover:bg-paint-hi">ค้นหา</button>
      </form>
      <p className="-mt-3 text-sm text-muted">ลอง: ทะเบียน กข 1234 + รหัส BK-1042 · ใบเสร็จดูได้ด้วยทะเบียนอย่างเดียว</p>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-6">
          {plate ? (
            <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
              <h2 className="text-xl font-bold">ใบเสร็จย้อนหลัง · {plate}</h2>
              {myPayments.length === 0 ? <p className="text-muted">ยังไม่มีใบเสร็จ</p> : (
                <div className="overflow-x-auto">
                  <table className="num w-full text-left text-sm">
                    <thead className="text-muted"><tr><th className="py-2">เลขที่</th><th>วันที่</th><th>เข้า–ออก</th><th>ชำระด้วย</th><th className="text-right">ยอด</th></tr></thead>
                    <tbody>
                      {myPayments.map((p) => (
                        <tr key={p.ref} className="border-t border-line">
                          <td className="py-2.5">{p.ref}</td><td>{formatDate(p.timeOut)}</td><td>{formatTime(p.timeIn)}–{formatTime(p.timeOut)}</td>
                          <td>{p.method === "Cash" ? "เงินสด" : "ThaiQR"}{p.bookingFee ? " · รวมค่าจอง" : ""}</td><td className="text-right font-semibold">{formatBaht(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            <section className="grid content-start gap-2 rounded-lg border border-dashed border-ink/30 p-6">
              <h2 className="text-xl font-bold">ใบเสร็จย้อนหลัง</h2>
              <p className="text-muted">กรอกเลขทะเบียนด้านบน เพื่อดูใบเสร็จทุกครั้งที่จอดที่{lot.name}</p>
            </section>
          )}
        </div>
        <div className="grid gap-6 lg:sticky lg:top-6">
          {plate && code ? (
            <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
              <h2 className="text-xl font-bold">การจอง {code.toUpperCase()}</h2>
              {!booking ? (
                <p className="text-muted">ไม่พบการจองที่ทะเบียนและรหัสตรงกัน ตรวจสอบอีกครั้ง</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-[4px] px-2.5 py-0.5 text-sm font-semibold ${BADGE[status ?? "confirmed"]}`}>{status ? STATUS_TH[status] : "…"}</span>
                    {booking.originalSlot && <span className="text-sm text-warn">ระบบย้ายจากช่อง {booking.originalSlot} เพราะมีรถอื่นจอดอยู่</span>}
                  </div>
                  <dl className="num grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                    <dt className="text-muted">ทะเบียน</dt><dd>{booking.plate}</dd>
                    <dt className="text-muted">ช่อง</dt><dd className="font-semibold">{booking.slot}</dd>
                    <dt className="text-muted">มาถึง</dt><dd>{formatDate(bookingStart(booking))} {formatTime(bookingStart(booking))} น.</dd>
                    <dt className="text-muted">ค่าบริการจอง</dt><dd>{lot.rates.bookingFee ?? 0} บาท (จ่ายรวมตอนออก ยกเลิกฟรี)</dd>
                  </dl>
                  {status === "confirmed" && !editing && (
                    <div className="flex flex-wrap gap-2">
                      {changeBlock
                        ? <span className="self-center text-sm text-muted">{changeBlock}</span>
                        : <button type="button" onClick={() => startEdit(booking)} className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-ink">เปลี่ยนเวลามาถึง ({RULES.maxChanges - (booking.changes ?? 0)} ครั้งที่เหลือ)</button>}
                      <button type="button" onClick={() => { update(booking.id, { status: "cancelled" }); setMsg({ ok: true, text: "ยกเลิกการจองแล้ว ไม่มีค่าใช้จ่าย ช่องถูกปล่อยให้ผู้อื่น" }); }}
                        className="rounded-md border border-bad/40 bg-white px-3 py-2 text-sm font-semibold text-bad hover:bg-bad/5">ยกเลิกการจอง</button>
                    </div>
                  )}
                  {status === "confirmed" && editing && now && (
                    <div className="grid gap-3 rounded-md bg-surface p-4">
                      <p className="text-sm font-semibold">เวลามาถึงใหม่</p>
                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input id="re-date" type="date" min={todayISO(now)} max={todayISO(new Date(now.getTime() + RULES.maxDaysAhead * 86400000))}
                          value={newDate} onChange={(e) => { setNewDate(e.target.value); setProposal(null); setMsg(null); }} className="rounded-md border border-line bg-white px-3 py-2.5" />
                        <select id="re-time" value={newTime} onChange={(e) => { setNewTime(e.target.value); setProposal(null); setMsg(null); }} className="rounded-md border border-ink/35 bg-white px-3 py-2.5">
                          {arrivalTimeOptions(lot, 15).map((t) => <option key={t} value={t}>{t} น.</option>)}
                        </select>
                        {proposal
                          ? <button type="button" onClick={() => saveChange(booking, proposal.slot)} className="rounded-md bg-paint hover:bg-paint-hi px-4 py-2.5 font-display font-semibold text-ink">ใช้ช่อง {proposal.slot}</button>
                          : <button type="button" onClick={() => checkNewTime(booking)} className="rounded-md bg-paint hover:bg-paint-hi px-4 py-2.5 font-display font-semibold text-ink">ตรวจและเปลี่ยน</button>}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                        <span>ระบบจะพยายามเก็บช่อง {booking.slot} ไว้ให้ ถ้าไม่ว่างจะเสนอช่องประเภทเดียวกันแทน</span>
                        <button type="button" onClick={() => { setEditing(false); setProposal(null); setMsg(null); }} className="underline">ไม่เปลี่ยน</button>
                      </div>
                    </div>
                  )}
                  {status !== "confirmed" && <p className="text-sm text-muted">การจองนี้แก้ไขไม่ได้แล้ว ({status ? STATUS_TH[status] : ""})</p>}
                  {msg && <p className={`rounded-md px-3 py-2 text-sm ${msg.ok ? "bg-paint-soft text-paint-ink" : "bg-bad/10 text-bad"}`}>{msg.text}</p>}
                </>
              )}
            </section>
          ) : (
            <section className="grid content-start gap-3 rounded-lg bg-asphalt p-5 text-white">
              <h2 className="text-xl font-bold">จัดการการจอง</h2>
              <p className="text-white/80">กรอกทะเบียนคู่กับรหัสการจอง (เช่น BK-1042) เพื่อเลื่อนเวลามาถึงหรือยกเลิกการจอง</p>
              <a href={`/${lot.id}/book`} className="flex items-center justify-between rounded-md bg-paint px-4 py-3 font-display font-semibold text-ink hover:bg-paint-hi">ยังไม่ได้จอง? จองที่จอด<span aria-hidden>→</span></a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
