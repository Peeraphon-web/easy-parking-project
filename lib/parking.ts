// ===== ฟังก์ชันกลางเรื่องค่าจอดและทะเบียน (ทุกหน้าเรียกใช้จากที่นี่) =====
import type { Rates } from "@/types";

export function minutesBetween(from: string | Date, to: string | Date): number {
  return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000));
}

// ฟรี N นาทีแรก → เกินแล้วคิดรายชั่วโมง (ปัดขึ้น) → ไม่เกินเหมาจ่ายต่อวัน (คิดทีละวัน)
export function calcFee(minutes: number, rates: Rates): number {
  if (minutes <= rates.freeMinutes) return 0;
  const days = Math.floor(minutes / 1440);
  const rest = minutes % 1440;
  const restFee = Math.min(rates.dayMax, Math.ceil(rest / 60) * rates.perHour);
  return days * rates.dayMax + restFee;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} ชม. ${m} นาที` : `${m} นาที`;
}

export const formatBaht = (n: number) => `${n.toLocaleString("th-TH")} บาท`;

export const formatTime = (d: string | Date) =>
  new Date(d).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

// "กข 1234" → "กข1234"
export const normalizePlate = (s = "") => s.replace(/\s+/g, "");

// ทะเบียนไทย: เลขนำหน้า 0-1 ตัว + พยัญชนะ 1-3 ตัว + เลข 1-4 ตัว เช่น กข 1234, 7กพ 5521
export const isValidPlate = (s: string) => /^[0-9]?[ก-ฮ]{1,3}[0-9]{1,4}$/.test(normalizePlate(s));

export const samePlate = (a: string, b: string) => normalizePlate(a) === normalizePlate(b);

export const newRef = (prefix = "AP") => `${prefix}-${Date.now().toString().slice(-8)}`;
