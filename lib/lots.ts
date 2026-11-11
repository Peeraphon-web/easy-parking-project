// ===== อ่านข้อมูลสถานที่ ผัง รถ การจอง การชำระเงิน =====
import lotsData from "@/data/lots.json";
import layoutsData from "@/data/layouts.json";
import carsData from "@/data/cars.json";
import bookingsData from "@/data/bookings.json";
import paymentsData from "@/data/payments.json";
import adminsData from "@/data/admins.json";
import type { Admin, Booking, Car, CarRecord, Layout, Lot, Payment, SlotStatus } from "@/types";

export const LOTS = lotsData as Lot[];
export const LAYOUTS = layoutsData as Layout[];
export const CAR_RECORDS = carsData as CarRecord[];
export const BOOKINGS = bookingsData as Booking[];
export const PAYMENTS = paymentsData as Payment[];
export const ADMINS = adminsData as Admin[];

export function getLot(id: string | undefined, lots: Lot[] = LOTS): Lot | undefined {
  return lots.find((l) => l.id === id);
}

export function getLayout(lotId: string, floor: string, layouts: Layout[] = LAYOUTS): Layout | undefined {
  return layouts.find((l) => l.lotId === lotId && l.floor === floor);
}

export function slotCodes(layout: Layout | undefined): string[] {
  return layout ? layout.cells.filter((c) => c.type === "slot" && c.code).map((c) => c.code!) : [];
}

// แปลง minutesAgo → เวลาเข้าจริงเทียบกับ now
export function getCars(now: Date, lotId?: string): Car[] {
  return CAR_RECORDS.filter((c) => !lotId || c.lotId === lotId).map(({ minutesAgo, ...c }) => ({
    ...c,
    timeIn: new Date(now.getTime() - minutesAgo * 60000).toISOString(),
  }));
}

// ตัวเลขสุ่มแบบคงที่จากข้อความ (ผลเหมือนเดิมทุกครั้ง)
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

// จำลอง "เซนเซอร์" ที่แต่ละช่อง: บอกแค่ว่าตอนนี้มีรถหรือไม่ (ไม่รู้ว่าเป็นรถคันไหน)
// รถใน cars.json = มีรถ, ช่องอื่นสุ่มแบบคงที่ประมาณ 50%
export function getSensorStatus(lotId: string, layouts: Layout[]): Record<string, "free" | "busy"> {
  const status: Record<string, "free" | "busy"> = {};
  layouts
    .filter((l) => l.lotId === lotId)
    .forEach((l) => slotCodes(l).forEach((code) => (status[code] = hash(lotId + code) < 0.5 ? "busy" : "free")));
  CAR_RECORDS.filter((c) => c.lotId === lotId).forEach((c) => (status[c.slot] = "busy"));
  return status;
}

export function getCell(layouts: Layout[], lotId: string, code: string) {
  for (const l of layouts) {
    if (l.lotId !== lotId) continue;
    const c = l.cells.find((x) => x.code === code);
    if (c) return { cell: c, floor: l.floor };
  }
  return undefined;
}

export function countByFloor(lot: Lot, layouts: Layout[], status: Record<string, SlotStatus>) {
  return lot.floors.map((floor) => {
    const codes = slotCodes(getLayout(lot.id, floor, layouts));
    const free = codes.filter((c) => status[c] === "free").length;
    return { floor, total: codes.length, free };
  });
}

// วันที่ตามเวลาเครื่อง (ไม่ใช้ toISOString เพราะเป็นเวลา UTC จะได้วันผิดตอนเช้ามืด)
export const todayISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
