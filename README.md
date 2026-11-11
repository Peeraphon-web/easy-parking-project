# Easy Parking

ระบบลานจอดรถอัตโนมัติแบบ **ระบบกลาง ใช้ได้หลายสถานที่** · โปรเจกต์ Front End (CSI201)
Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Chart.js · ข้อมูลทั้งหมดเป็น Mock data

## เริ่มใช้งาน

```bash
npm install
npm run dev
```
เปิด http://localhost:3000

## ลองใช้งาน

| ทำอะไร | ไปที่ |
|---|---|
| เลือกสถานที่ | `/` |
| หน้าแรกของลาน (ช่องว่าง + ผัง) | `/easy-mall` หรือ `/green-condo` |
| ชำระค่าจอด | `/easy-mall/pay` ลองทะเบียน **กข 1234**, **7กพ 5521** |
| จองที่จอด | `/easy-mall/book` |
| ประวัติ | `/easy-mall/history` ลอง **กข 1234** |
| ตู้ Kiosk ทางออก | `/kiosk/easy-mall/A` |
| ผู้ดูแลระบบ | `/admin/login` → **admin / 1234** (Super Admin), **mall / 1234**, **condo / 1234** |

ข้อมูลที่แก้ (จอง จ่าย ผัง สถานที่ สิทธิ์) เก็บใน localStorage ของเบราว์เซอร์
กด **คืนค่า Mock data เดิม** ที่หน้า `/admin/lots` เพื่อล้าง

## แผนผัง path

| URL | ไฟล์ |
|---|---|
| `/` | `app/(user)/page.tsx` |
| `/[lot]` | `app/(user)/[lot]/page.tsx` |
| `/[lot]/pay` | `app/(user)/[lot]/pay/page.tsx` |
| `/[lot]/book` | `app/(user)/[lot]/book/page.tsx` |
| `/[lot]/history` | `app/(user)/[lot]/history/page.tsx` |
| `/kiosk/[lot]/[exit]` | `app/kiosk/[lot]/[exit]/page.tsx` |
| `/admin/login` | `app/admin/login/page.tsx` |
| `/admin/dashboard` | `app/admin/(panel)/dashboard/page.tsx` |
| `/admin/door` | `app/admin/(panel)/door/page.tsx` |
| `/admin/slots` | `app/admin/(panel)/slots/page.tsx` |
| `/admin/finance` | `app/admin/(panel)/finance/page.tsx` |
| `/admin/activity` | `app/admin/(panel)/activity/page.tsx` |
| `/admin/lots` | `app/admin/(panel)/lots/page.tsx` (Super Admin) |
| `/admin/layout-editor` | `app/admin/(panel)/layout-editor/page.tsx` (Super Admin) |
| `/admin/roles` | `app/admin/(panel)/roles/page.tsx` (Super Admin) |

## โฟลเดอร์

- `types/index.ts` type ของข้อมูลทั้งหมด
- `data/` Mock data: `lots`, `layouts`, `cars`, `bookings`, `payments`, `admins`
- `lib/parking.ts` คำนวณค่าจอด เช็กทะเบียน จัดรูปแบบเวลาและเงิน
- `lib/lots.ts` อ่านข้อมูลสถานที่ ผัง รถ และจำลองสถานะช่องจอด
- `lib/storage.ts` localStorage + `useStored`, `useNow`
- `lib/routes.ts` เมนูทั้งหมด
- `context/` `LotContext` (ข้อมูลที่แก้ได้ + ลานที่เลือก), `AuthContext` (ผู้ดูแลที่ล็อกอิน)
- `components/` Navbar, Sidebar, LotSwitcher, FloorMap, Plate, PageHeader, Stat, QrMock

## กติกากลุ่ม

1. ใช้สีจาก `@theme` ใน `app/globals.css` เช่น `bg-navy`, `text-brand-dark` ห้ามใส่สีเอง
2. คำนวณค่าจอดด้วย `calcFee()` ใน `lib/parking.ts` เท่านั้น
3. แตก branch ตามหน้า เช่น `feature/kiosk` แล้วเปิด Pull Request เข้า `main`
4. ห้ามเรียก `new Date()` ตรงๆ ตอน render ให้ใช้ `useNow()` (Next.js 16 จะ error)

## ข้อจำกัด

- ไม่มี Back End และฐานข้อมูลจริง
- กล้อง Kiosk เปิดกล้องจริงได้ (ต้องเป็น localhost หรือ https) แต่ผลการอ่านป้ายเป็นการจำลอง
- ThaiQR เป็นภาพจำลอง ไม่ได้ตัดเงินจริง
