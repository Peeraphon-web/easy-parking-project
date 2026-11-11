// ===== เมนูและ path ทั้งเว็บ (เพิ่มหน้าใหม่ที่นี่ที่เดียว) =====
import type { MenuKey } from "@/types";

// ฝั่งผู้ใช้: path ขึ้นกับสถานที่
export const userNav = (lot: string) => [
  { href: `/${lot}`, label: "หน้าแรก" },
  { href: `/${lot}/pay`, label: "ชำระค่าจอด" },
  { href: `/${lot}/book`, label: "จองที่จอด" },
  { href: `/${lot}/history`, label: "ประวัติ" },
];

// ฝั่งผู้ดูแล: superOnly = เห็นเฉพาะ Super Admin
export const ADMIN_MENU: { key: MenuKey; href: string; label: string; superOnly?: boolean }[] = [
  { key: "dashboard", href: "/admin/dashboard", label: "ภาพรวม" },
  { key: "door", href: "/admin/door", label: "Door Parking" },
  { key: "slots", href: "/admin/slots", label: "สถานะช่องจอด" },
  { key: "finance", href: "/admin/finance", label: "Report Finance" },
  { key: "activity", href: "/admin/activity", label: "Report Activity" },
  { key: "lots", href: "/admin/lots", label: "จัดการสถานที่", superOnly: true },
  { key: "layout-editor", href: "/admin/layout-editor", label: "ออกแบบผัง", superOnly: true },
  { key: "roles", href: "/admin/roles", label: "สิทธิ์ผู้ใช้", superOnly: true },
];

export const kioskPath = (lot: string, exit: string) => `/kiosk/${lot}/${exit}`;
