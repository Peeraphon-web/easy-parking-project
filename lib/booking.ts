// ===== กติกาการจองทั้งหมด (ทุกหน้าใช้จากไฟล์นี้) =====
//
// 1. จองล่วงหน้าได้ตั้งแต่ 30 นาทีถึง 7 วัน · ระบุแค่ "เวลาที่จะมาถึง" ต้องอยู่ในเวลาเปิด และก่อนปิดอย่างน้อย 1 ชม.
// 2. ไม่ต้องระบุเวลาออก แต่ระบบกันช่องไว้โดยประมาณ 15 นาทีก่อนเวลามาถึง ถึง 2 ชั่วโมงหลังจากนั้น
//    เพื่อไม่ให้รับจองช่องเดิมซ้อนถี่เกินไป (จอดนานกว่านี้ได้ ค่าจอดคิดตามจริง)
// 3. จองภายใน 2 ชั่วโมงข้างหน้า: ช่องที่มีรถจอดอยู่ตอนนี้นับว่าไม่ว่าง (ไม่รู้ว่ารถจะออกเมื่อไหร่)
// 4. ทะเบียนเดียวจองซ้อนช่วงเวลากันไม่ได้
// 5. รับจองไม่เกิน 80% ของช่องทั้งลานในช่วงเวลาเดียวกัน (สำรองไว้ย้ายช่องและให้รถที่ไม่ได้จอง)
// 6. เลยเวลาเริ่ม 15 นาทีแล้วรถยังไม่เข้า → no_show ปล่อยช่องคืน
// 7. รถที่จองเข้ามาแล้วช่องมีรถอื่นจอดทับ → ย้ายไปช่องว่างประเภทเดียวกัน ชั้นเดียวกันก่อน
// 8. เปลี่ยนเวลามาถึงได้ 2 ครั้ง จนถึง 15 นาทีหลังเวลาเดิม · ถ้าช่องเดิมไม่ว่างในเวลาใหม่ เสนอช่องประเภทเดียวกันแทน
import { getCell, getSensorStatus, slotCodes } from "@/lib/lots";
import { normalizePlate } from "@/lib/parking";
import type { Booking, BookingStatus, Layout, Lot, SlotStatus } from "@/types";

export const RULES = {
  minLeadMinutes: 30,   // ต้องจองก่อนเวลาเริ่มอย่างน้อย
  maxDaysAhead: 7,      // จองล่วงหน้าได้ไม่เกิน
  holdBeforeMin: 15,    // กันช่องก่อนเวลาเริ่ม
  graceAfterMin: 15,    // มาสายได้ไม่เกิน แล้วจะเป็น no_show
  nearHours: 2,         // จองใกล้กว่านี้ ต้องดูรถที่จอดอยู่ตอนนี้ด้วย
  bookableRatio: 0.8,   // สัดส่วนช่องที่เปิดให้จองได้
  estimateHours: 2,     // เวลาจอดโดยประมาณ ใช้กันช่องไม่ให้จองซ้อน (ผู้ใช้ไม่ต้องกรอก)
  lastBookBeforeCloseMin: 60, // เวลามาถึงต้องก่อนปิดอย่างน้อย
  maxChanges: 2,        // เปลี่ยนเวลามาถึงได้กี่ครั้ง
  changeLeadMinutes: 10, // เวลาใหม่ต้องห่างจากตอนนี้อย่างน้อย (ตอนเปลี่ยนเวลา)
};

const MIN = 60000;

// ---------- เวลา ----------
export const bookingStart = (b: Pick<Booking, "date" | "time">) => new Date(`${b.date}T${b.time}:00`);
// เวลาสิ้นสุดโดยประมาณ (ใช้กันช่องเท่านั้น ไม่ใช่เวลาที่ผู้ใช้ต้องออก)
export const bookingEnd = (b: Pick<Booking, "date" | "time">) => new Date(bookingStart(b).getTime() + RULES.estimateHours * 60 * MIN);
const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart < bEnd && bStart < aEnd;

// สถานะจริง ณ เวลานี้ (confirmed ที่เลยเวลา 15 นาทีแล้ว = no_show)
export function resolveStatus(b: Booking, now: Date): BookingStatus {
  if (b.status === "confirmed" && now.getTime() > bookingStart(b).getTime() + RULES.graceAfterMin * MIN) return "no_show";
  return b.status;
}

// การจองนี้ยังกันช่องอยู่ไหม
export const isHolding = (b: Booking, now: Date) => {
  const s = resolveStatus(b, now);
  return s === "confirmed" || s === "checked_in";
};

// ช่วงเวลาที่การจองกันช่องไว้
const holdRange = (b: Booking) => [new Date(bookingStart(b).getTime() - RULES.holdBeforeMin * MIN), bookingEnd(b)] as const;

export const STATUS_TH: Record<BookingStatus, string> = {
  confirmed: "ยืนยันแล้ว",
  checked_in: "เข้าจอดแล้ว",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิกแล้ว",
  no_show: "ไม่มาตามนัด",
};

// ---------- เวลาเปิดทำการ ----------
// "10:00–22:00" → [600, 1320] นาทีของวัน · "24 ชั่วโมง" → null (เปิดตลอด)
export function openRange(lot: Lot): [number, number] | null {
  const m = lot.openHours.match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])];
}

// ---------- สถานะช่องจอด ----------
// ตอนนี้: เซนเซอร์ + การจองที่กำลังกันช่องอยู่
export function getSlotStatus(lotId: string, layouts: Layout[], bookings: Booking[], now: Date): Record<string, SlotStatus> {
  const status: Record<string, SlotStatus> = { ...getSensorStatus(lotId, layouts) };
  bookings
    .filter((b) => b.lotId === lotId && isHolding(b, now))
    .forEach((b) => {
      const [s, e] = holdRange(b);
      if (now >= s && now < e && status[b.slot] !== "busy") status[b.slot] = "reserved";
    });
  return status;
}

// ช่วงเวลาในอนาคต: การจองที่ทับช่วง + (ถ้าใกล้) รถที่จอดอยู่ตอนนี้
export function getAvailability(
  lotId: string, layouts: Layout[], bookings: Booking[], start: Date, end: Date, now: Date, ignoreId?: string,
): Record<string, SlotStatus> {
  const sensor = getSensorStatus(lotId, layouts);
  const near = start.getTime() - now.getTime() < RULES.nearHours * 60 * MIN;
  const status: Record<string, SlotStatus> = {};
  Object.keys(sensor).forEach((code) => (status[code] = near && sensor[code] === "busy" ? "busy" : "free"));
  bookings
    .filter((b) => b.lotId === lotId && b.id !== ignoreId && isHolding(b, now))
    .forEach((b) => {
      const [s, e] = holdRange(b);
      if (overlaps(start, end, s, e) && status[b.slot] === "free") status[b.slot] = "reserved";
    });
  return status;
}

// ---------- ตรวจการจอง ----------
export type BookingDraft = Pick<Booking, "lotId" | "plate" | "slot" | "date" | "time">;

// คืนข้อความ error เป็นภาษาไทย หรือ null ถ้าจองได้
export function validateBooking(
  draft: BookingDraft, lot: Lot, layouts: Layout[], bookings: Booking[], now: Date, ignoreId?: string,
  opts: { minLeadMinutes?: number } = {},
): string | null {
  const start = bookingStart(draft);
  const end = bookingEnd(draft);
  if (Number.isNaN(start.getTime())) return "กรุณาเลือกวันและเวลา";

  const lead = (start.getTime() - now.getTime()) / MIN;
  const minLead = opts.minLeadMinutes ?? RULES.minLeadMinutes;
  if (lead < minLead) return `เวลามาถึงต้องห่างจากตอนนี้อย่างน้อย ${minLead} นาที`;
  if (lead > RULES.maxDaysAhead * 24 * 60) return `จองล่วงหน้าได้ไม่เกิน ${RULES.maxDaysAhead} วัน`;

  const open = openRange(lot);
  if (open) {
    const s = start.getHours() * 60 + start.getMinutes();
    if (s < open[0] || s > open[1] - RULES.lastBookBeforeCloseMin)
      return `${lot.name} เปิด ${lot.openHours} เวลามาถึงต้องอยู่ในช่วงเปิด และก่อนปิดอย่างน้อย ${RULES.lastBookBeforeCloseMin} นาที`;
  }

  const holding = bookings.filter((b) => b.lotId === lot.id && b.id !== ignoreId && isHolding(b, now));
  const clash = (b: Booking) => { const [s, e] = holdRange(b); return overlaps(start, end, s, e); };

  if (holding.some((b) => normalizePlate(b.plate) === normalizePlate(draft.plate) && clash(b)))
    return "ทะเบียนนี้มีการจองในช่วงเวลานี้อยู่แล้ว";

  const avail = getAvailability(lot.id, layouts, bookings, start, end, now, ignoreId);
  if (avail[draft.slot] === "busy") return `ช่อง ${draft.slot} มีรถจอดอยู่ และอาจยังไม่ออกภายในเวลาที่จอง เลือกช่องอื่น`;
  if (avail[draft.slot] === "reserved") return `ช่อง ${draft.slot} มีคนจองช่วงเวลานี้แล้ว`;

  const total = layouts.filter((l) => l.lotId === lot.id).reduce((a, l) => a + slotCodes(l).length, 0);
  const limit = Math.floor(total * RULES.bookableRatio);
  if (holding.filter(clash).length >= limit) return "ช่วงเวลานี้เปิดรับจองเต็มแล้ว (สำรองช่องไว้สำหรับรถที่ไม่ได้จอง) ลองเลือกเวลาอื่น";

  return null;
}

// ---------- ตอนรถที่จองเข้ามา ----------
// คืนช่องที่จะให้จอด: ช่องเดิมถ้าว่าง ไม่งั้นหาช่องประเภทเดียวกัน ชั้นเดียวกันก่อน
export function assignOnArrival(booking: Booking, layouts: Layout[], bookings: Booking[], now: Date):
  { slot: string; moved: boolean } | null {
  const sensor = getSensorStatus(booking.lotId, layouts);
  if (sensor[booking.slot] !== "busy") return { slot: booking.slot, moved: false };

  const orig = getCell(layouts, booking.lotId, booking.slot);
  const kind = orig?.cell.kind ?? "normal";
  const avail = getAvailability(booking.lotId, layouts, bookings, now, bookingEnd(booking), now, booking.id);
  const candidates = layouts
    .filter((l) => l.lotId === booking.lotId)
    .sort((a, b) => Number(b.floor === orig?.floor) - Number(a.floor === orig?.floor))
    .flatMap((l) => l.cells.filter((c) => c.type === "slot" && c.code && (c.kind ?? "normal") === kind).map((c) => c.code!));
  const found = candidates.find((code) => sensor[code] === "free" && avail[code] === "free");
  return found ? { slot: found, moved: true } : null;
}

// การจองของทะเบียนนี้ที่ใกล้เวลาที่สุด (สำหรับตอนรถเข้า: ตั้งแต่ 15 นาทีก่อน ถึง 15 นาทีหลังเวลาเริ่ม)
export function findArrivalBooking(lotId: string, plate: string, bookings: Booking[], now: Date) {
  return bookings.find((b) => {
    if (b.lotId !== lotId || resolveStatus(b, now) !== "confirmed") return false;
    if (normalizePlate(b.plate) !== normalizePlate(plate)) return false;
    const diff = (now.getTime() - bookingStart(b).getTime()) / MIN;
    return diff >= -RULES.holdBeforeMin && diff <= RULES.graceAfterMin;
  });
}

// ---------- ค่าบริการจอง ----------
// รถคันนี้เข้ามาด้วยการจองไหม (สถานะ "เข้าจอดแล้ว") → เก็บค่าบริการจองรวมกับค่าจอด
export function bookingFeeFor(lot: Lot, plate: string, bookings: Booking[]): number {
  const booked = bookings.some((b) => b.lotId === lot.id && b.status === "checked_in" && normalizePlate(b.plate) === normalizePlate(plate));
  return booked ? lot.rates.bookingFee ?? 0 : 0;
}

// ---------- เปลี่ยนเวลามาถึง ----------
export function canChangeTime(b: Booking, now: Date): string | null {
  if (resolveStatus(b, now) !== "confirmed") return "การจองนี้ไม่อยู่ในสถานะที่เปลี่ยนเวลาได้";
  if ((b.changes ?? 0) >= RULES.maxChanges) return `เปลี่ยนเวลาครบ ${RULES.maxChanges} ครั้งแล้ว ถ้าต้องการเวลาอื่นให้ยกเลิกแล้วจองใหม่`;
  return null;
}

// ลองเวลาใหม่กับช่องเดิมก่อน ถ้าไม่ได้ หาช่องประเภทเดียวกัน (ชั้นเดียวกันก่อน) ที่จองเวลาใหม่ได้
export function planReschedule(
  b: Booking, date: string, time: string, lot: Lot, layouts: Layout[], bookings: Booking[], now: Date,
): { ok: true; slot: string; moved: boolean } | { ok: false; error: string } {
  const opts = { minLeadMinutes: RULES.changeLeadMinutes };
  const draft = { ...b, date, time };
  const err = validateBooking(draft, lot, layouts, bookings, now, b.id, opts);
  if (!err) return { ok: true, slot: b.slot, moved: false };
  if (!/^ช่อง /.test(err)) return { ok: false, error: err }; // ผิดกติกาอื่น (เวลา/ทะเบียน/เต็ม) ย้ายช่องก็ไม่ช่วย

  const orig = getCell(layouts, lot.id, b.slot);
  const kind = orig?.cell.kind ?? "normal";
  const candidates = layouts
    .filter((l) => l.lotId === lot.id)
    .sort((x, y) => Number(y.floor === orig?.floor) - Number(x.floor === orig?.floor))
    .flatMap((l) => l.cells.filter((c) => c.type === "slot" && c.code && (c.kind ?? "normal") === kind).map((c) => c.code!));
  const found = candidates.find((code) => code !== b.slot && !validateBooking({ ...draft, slot: code }, lot, layouts, bookings, now, b.id, opts));
  return found ? { ok: true, slot: found, moved: true } : { ok: false, error: `${err} และไม่มีช่องประเภทเดียวกันว่างในเวลานี้` };
}

// เวลามาถึงที่เลือกได้ ภายในเวลาเปิด และก่อนปิดอย่างน้อย 1 ชม.
export function arrivalTimeOptions(lot: Lot, stepMin = 30): string[] {
  const open = openRange(lot);
  const [from, to] = open ? [open[0], open[1] - RULES.lastBookBeforeCloseMin + 1] : [0, 24 * 60];
  const pad = (n: number) => String(n).padStart(2, "0");
  const list: string[] = [];
  for (let m = from; m < to; m += stepMin) list.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return list;
}
