"use client";
// หน้า /admin/lots: เพิ่ม/แก้ไข/ลบสถานที่ และอัตราค่าจอด (Super Admin)
import Link from "next/link";
import { useState } from "react";
import FloorBadge from "@/components/FloorBadge";
import PageHeader from "@/components/PageHeader";
import ParkingPhoto from "@/components/ParkingPhoto";
import { useLots } from "@/context/LotContext";
import { MAX_UPLOAD_MB, fitsInStorage, resizeImage, sizeKB } from "@/lib/image";
import type { Lot } from "@/types";

const EMPTY: Lot = { id: "", name: "", address: "", openHours: "24 ชั่วโมง", phone: "", rates: { freeMinutes: 15, perHour: 20, dayMax: 300, bookingFee: 10 }, floors: ["1"], exits: ["A"] };

export default function LotsPage() {
  const { lots, setLots, setLayouts, resetAll } = useLots();
  const [form, setForm] = useState<Lot>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [imgError, setImgError] = useState("");
  const [imgBusy, setImgBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  // รับรูปจากปุ่มเลือกไฟล์หรือการลากวาง → ย่อ → เช็กพื้นที่ → ใส่ในฟอร์ม
  async function pickImage(file: File | undefined) {
    if (!file) return;
    setImgError(""); setImgBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      if (!fitsInStorage(dataUrl)) throw new Error("พื้นที่เก็บข้อมูลในเบราว์เซอร์เต็ม ลบรูปของสถานที่อื่นก่อน หรือกด “คืนค่า Mock data เดิม”");
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) {
      setImgError(err instanceof Error ? err.message : "อ่านรูปนี้ไม่ได้ ลองไฟล์อื่น");
    } finally {
      setImgBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = form.id.trim().toLowerCase();
    if (!/^[a-z0-9-]{3,30}$/.test(id)) return setError("รหัสสถานที่ใช้ได้เฉพาะ a-z, 0-9 และ - (3–30 ตัว) เพราะจะอยู่ใน URL");
    if (!form.name.trim()) return setError("กรุณากรอกชื่อสถานที่");
    if (!editing && lots.some((l) => l.id === id)) return setError("รหัสนี้มีอยู่แล้ว");
    const lot = { ...form, id };
    if (editing) setLots((prev) => prev.map((l) => (l.id === editing ? lot : l)));
    else {
      setLots((prev) => [...prev, lot]);
      // สร้างผังว่างให้ทุกชั้น ไปวาดต่อที่หน้า "ออกแบบผัง"
      setLayouts((prev) => [...prev, ...lot.floors.map((f) => ({ lotId: id, floor: f, cols: 10, rows: 6, cells: [] }))]);
    }
    setForm(EMPTY); setEditing(null); setError(""); setImgError("");
  }

  const field = "h-11 rounded-md border border-ink/35 px-3 text-base disabled:bg-surface disabled:text-muted";
  return (
    <>
      <PageHeader title="จัดการสถานที่" subtitle={`${lots.length} สถานที่ในระบบ`}>
        <button type="button" onClick={resetAll} className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-ink">คืนค่า Mock data เดิม</button>
      </PageHeader>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="grid gap-3">
        {lots.map((l) => (
          <div key={l.id} className="flex flex-wrap items-start gap-3 rounded-lg bg-white shadow-card p-4">
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md">
              <ParkingPhoto key={l.image ? "upload" : "default"} src={l.image || `/images/lots/${l.id}.jpg`} alt={`รูป ${l.name}`} scene={l.scene} />
            </div>
            <div className="grid min-w-0 flex-1 gap-2">
              <div><b className="font-display text-lg">{l.name}</b> <span className="text-sm text-muted">/{l.id}</span></div>
              <div className="flex flex-wrap items-center gap-1.5">
                {l.floors.map((f, i) => <FloorBadge key={f} floor={f} index={i} size="xs" />)}
                <span className="ml-1 text-sm text-muted">ทางออก {l.exits.join(", ")}</span>
              </div>
              <dl className="num flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <div><dt className="inline text-muted">ฟรี </dt><dd className="inline font-semibold">{l.rates.freeMinutes} นาที</dd></div>
                <div><dt className="inline text-muted">ชม.ละ </dt><dd className="inline font-semibold">{l.rates.perHour} บาท</dd></div>
                <div><dt className="inline text-muted">สูงสุด/วัน </dt><dd className="inline font-semibold">{l.rates.dayMax} บาท</dd></div>
                <div><dt className="inline text-muted">ค่าจอง </dt><dd className="inline font-semibold">{l.rates.bookingFee ?? 0} บาท</dd></div>
              </dl>
            </div>
            <Link href={`/${l.id}`} className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-ink">ดูหน้าผู้ใช้</Link>
            <button type="button" onClick={() => { setForm(l); setEditing(l.id); }} className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-ink">แก้ไข</button>
            {confirmDelete === l.id ? (
              <span className="flex gap-1">
                <button type="button" onClick={() => { setLots((p) => p.filter((x) => x.id !== l.id)); setLayouts((p) => p.filter((x) => x.lotId !== l.id)); setConfirmDelete(null); }}
                  className="rounded-md bg-bad px-3 py-1.5 text-sm font-semibold text-white">ยืนยันลบ</button>
                <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-ink">ไม่ลบ</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(l.id)} className="rounded-md border border-bad/40 bg-white px-3 py-1.5 text-sm font-semibold text-bad hover:bg-bad/5">ลบ</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-lg bg-white shadow-card p-5 xl:sticky xl:top-6">
        <h2 className="text-xl font-bold">{editing ? `แก้ไข ${editing}` : "เพิ่มสถานที่ใหม่"}</h2>

        {/* รูปสถานที่: ลากวาง หรือกดเลือกไฟล์ */}
        <div className="grid gap-1.5 text-sm">
          <span>รูปสถานที่ <span className="text-muted">(แสดงที่การ์ดหน้าแรก)</span></span>
          <label htmlFor="lot-image"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickImage(e.dataTransfer.files[0]); }}
            className={`relative block aspect-[16/9] cursor-pointer overflow-hidden rounded-lg border-2 border-dashed ${dragging ? "border-ink bg-paint-soft" : "border-ink/25"}`}>
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="ตัวอย่างรูปสถานที่" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full place-items-center p-4 text-center text-muted">
                <span>{imgBusy ? "กำลังย่อรูป…" : <>ลากรูปมาวางที่นี่ หรือ <u className="text-ink">เลือกไฟล์</u><br /><small>JPG, PNG, WebP ไม่เกิน {MAX_UPLOAD_MB} MB · ระบบย่อให้อัตโนมัติ</small></>}</span>
              </span>
            )}
          </label>
          <input id="lot-image" type="file" accept="image/*" className="sr-only"
            onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }} />
          {form.image && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="lot-image" className="cursor-pointer rounded-md border border-line px-3 py-1.5 font-semibold hover:border-ink">เปลี่ยนรูป</label>
              <button type="button" onClick={() => setForm({ ...form, image: undefined })} className="rounded-md border border-bad/40 px-3 py-1.5 font-semibold text-bad hover:bg-bad/5">ลบรูป</button>
              <span className="num text-xs text-muted">{sizeKB(form.image)} KB</span>
            </div>
          )}
          {imgError && <p className="rounded-md bg-bad/10 px-3 py-2 text-bad">{imgError}</p>}
          <label className="grid gap-1">ถ้าไม่ใส่รูป ใช้ภาพแทนแบบ
            <select id="lot-scene" value={form.scene ?? "mall"} onChange={(e) => setForm({ ...form, scene: e.target.value as Lot["scene"] })} className="h-11 rounded-md border border-ink/35 px-3 text-base">
              <option value="mall">ลานจอดในอาคาร (ห้าง / ออฟฟิศ)</option>
              <option value="condo">ลานจอดกลางแจ้ง (คอนโด / หมู่บ้าน)</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
          <label className="grid gap-1 text-sm">รหัส (ใช้ใน URL)<input id="lot-id" disabled={!!editing} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="เช่น siam-office" className={field} /></label>
          <label className="grid gap-1 text-sm">ชื่อสถานที่<input id="lot-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} /></label>
          <label className="grid gap-1 text-sm sm:col-span-2">ที่อยู่<input id="lot-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={field} /></label>
          <label className="grid gap-1 text-sm">เวลาเปิด<input id="lot-hours" value={form.openHours} onChange={(e) => setForm({ ...form, openHours: e.target.value })} className={field} /></label>
          <label className="grid gap-1 text-sm">เบอร์โทร<input id="lot-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} /></label>
          <label className="grid gap-1 text-sm">ชั้น (คั่นด้วย ,)<input id="lot-floors" disabled={!!editing} value={form.floors.join(",")} onChange={(e) => setForm({ ...form, floors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className={field} /></label>
          <label className="grid gap-1 text-sm">ประตูทางออก (คั่นด้วย ,)<input id="lot-exits" value={form.exits.join(",")} onChange={(e) => setForm({ ...form, exits: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className={field} /></label>
          {(["freeMinutes", "perHour", "dayMax", "bookingFee"] as const).map((k) => (
            <label key={k} className="grid gap-1 text-sm">{{ freeMinutes: "จอดฟรี (นาที)", perHour: "บาท/ชั่วโมง", dayMax: "สูงสุด/วัน (บาท)", bookingFee: "ค่าบริการจอง (บาท)" }[k]}
              <input id={`lot-${k}`} type="number" min={0} value={form.rates[k]} onChange={(e) => setForm({ ...form, rates: { ...form.rates, [k]: Number(e.target.value) } })} className={field} />
            </label>
          ))}
        </div>
        {error && <p className="rounded-lg bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>}
        <div className="flex gap-2">
          <button className="rounded-md bg-paint hover:bg-paint-hi px-5 py-2.5 font-display font-semibold text-ink">{editing ? "บันทึก" : "เพิ่มสถานที่"}</button>
          {editing && <button type="button" onClick={() => { setForm(EMPTY); setEditing(null); setImgError(""); }} className="rounded-md border border-line px-5 py-2.5">ยกเลิก</button>}
        </div>
      </form>
      </div>
    </>
  );
}
