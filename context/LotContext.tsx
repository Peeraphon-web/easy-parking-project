"use client";
// ===== ข้อมูลกลางที่แก้ได้: สถานที่ ผัง การจอง การชำระเงิน + ลานที่ผู้ดูแลเลือกอยู่ =====
import { createContext, useContext, useEffect, useMemo } from "react";
import { BOOKINGS, LAYOUTS, LOTS, PAYMENTS, getCars } from "@/lib/lots";
import { samePlate } from "@/lib/parking";
import { useStored } from "@/lib/storage";
import type { Booking, Car, Layout, Lot, Payment } from "@/types";

type LotValue = {
  lots: Lot[];
  setLots: (v: Lot[] | ((p: Lot[]) => Lot[])) => void;
  layouts: Layout[];
  setLayouts: (v: Layout[] | ((p: Layout[]) => Layout[])) => void;
  bookings: Booking[];
  setBookings: (v: Booking[] | ((p: Booking[]) => Booking[])) => void;
  payments: Payment[];
  setPayments: (v: Payment[] | ((p: Payment[]) => Payment[])) => void;
  cars: Car[];                            // รถที่ยังจอดอยู่ (จ่ายเงินแล้วจะหายไป)
  adminLotId: string;                     // ลานที่เลือกใน LotSwitcher (ฝั่ง Admin)
  setAdminLotId: (id: string) => void;
  resetAll: () => void;                   // ล้างข้อมูลที่แก้ กลับเป็น Mock data เดิม
};

const LotContext = createContext<LotValue | null>(null);

export function LotProvider({ children }: { children: React.ReactNode }) {
  const [lots, setLots, , resetLots] = useStored<Lot[]>("lots", LOTS);
  const [layouts, setLayouts, , resetLayouts] = useStored<Layout[]>("layouts", LAYOUTS);
  const [bookings, setBookings, , resetBookings] = useStored<Booking[]>("bookings", BOOKINGS);
  const [payments, setPayments, , resetPayments] = useStored<Payment[]>("payments", PAYMENTS);
  const [adminLotId, setAdminLotId] = useStored<string>("adminLot", LOTS[0]?.id ?? "");

  // "นาฬิกาจำลอง": เวลาเข้าของรถใน cars.json นับจากจุดนี้ (คงที่ ไม่ขยับตามเวลาจริง)
  // จึงจับคู่รถกับใบเสร็จได้ และเวลาจอดเพิ่มขึ้นจริงระหว่างสาธิต · เกิน 12 ชม. เริ่มรอบใหม่
  const [anchor, setAnchor, anchorReady, resetAnchor] = useStored<string>("anchor", "");
  useEffect(() => {
    if (!anchorReady) return;
    if (!anchor || Date.now() - new Date(anchor).getTime() > 12 * 3600000) setAnchor(new Date().toISOString());
  }, [anchor, anchorReady, setAnchor]);

  const cars = useMemo(
    () => anchor
      ? getCars(new Date(anchor)).filter((c) => !payments.some((p) => p.lotId === c.lotId && samePlate(p.plate, c.plate) && p.timeIn === c.timeIn))
      : [],
    [anchor, payments],
  );

  const value: LotValue = {
    lots, setLots, layouts, setLayouts, bookings, setBookings, payments, setPayments,
    cars, adminLotId, setAdminLotId,
    resetAll() {
      resetLots(); resetLayouts(); resetBookings(); resetPayments(); resetAnchor();
    },
  };

  return <LotContext.Provider value={value}>{children}</LotContext.Provider>;
}

export function useLots() {
  const ctx = useContext(LotContext);
  if (!ctx) throw new Error("useLots ต้องอยู่ใน <LotProvider>");
  return ctx;
}
