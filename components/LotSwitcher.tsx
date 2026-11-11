"use client";
// dropdown เลือกสถานที่ใน Sidebar (เห็นเฉพาะลานที่ผู้ดูแลคนนั้นมีสิทธิ์)
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLots } from "@/context/LotContext";

export default function LotSwitcher() {
  const { admin } = useAuth();
  const { lots, adminLotId, setAdminLotId } = useLots();
  const allowed = lots.filter((l) => admin?.role === "super" || admin?.lotIds.includes(l.id));

  // ถ้าลานที่เลือกอยู่ไม่อยู่ในสิทธิ์ ให้สลับไปลานแรกที่มีสิทธิ์
  useEffect(() => {
    if (allowed.length && !allowed.some((l) => l.id === adminLotId)) setAdminLotId(allowed[0].id);
  }, [allowed, adminLotId, setAdminLotId]);

  return (
    <label className="grid gap-1 text-xs text-white/70">
      สถานที่
      <select id="lot-switcher" value={adminLotId} onChange={(e) => setAdminLotId(e.target.value)}
        className="rounded-md border border-white/25 bg-asphalt-deep px-3 py-2.5 text-[15px] text-white">
        {allowed.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
    </label>
  );
}
