"use client";
// ปุ่ม "ส่งออกรายงาน" พร้อมเมนูย่อย ใช้ในหน้า Report Finance และ Report Activity
// <ExportMenu items={[{ label: "รายการชำระเงิน (CSV)", note: "...", onSelect: () => ... }]} />
import { useEffect, useRef, useState } from "react";
import { printReport } from "@/lib/export";

type Item = { label: string; note?: string; onSelect: () => void };

export default function ExportMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState("");
  const box = useRef<HTMLDivElement>(null);

  // ปิดเมนูเมื่อคลิกข้างนอกหรือกด Esc
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(""), 3000);
    return () => clearTimeout(t);
  }, [done]);

  const all: Item[] = [...items, { label: "พิมพ์ / บันทึกเป็น PDF", note: "หน้านี้ทั้งหน้า รวมกราฟ", onSelect: printReport }];

  return (
    <div ref={box} className="relative no-print">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md border border-ink/35 bg-white px-3 py-2 text-sm font-semibold hover:border-ink">
        ส่งออกรายงาน <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-1 grid w-72 gap-0.5 rounded-lg border border-line bg-white p-1.5 shadow-card">
          {all.map((it) => (
            <button key={it.label} type="button" role="menuitem"
              onClick={() => { it.onSelect(); setOpen(false); if (!it.label.startsWith("พิมพ์")) setDone(`ดาวน์โหลด ${it.label} แล้ว`); }}
              className="grid rounded-md px-3 py-2 text-left text-sm hover:bg-surface">
              <span className="font-semibold">{it.label}</span>
              {it.note && <span className="text-xs text-muted">{it.note}</span>}
            </button>
          ))}
        </div>
      )}
      {done && <p role="status" className="absolute right-0 mt-1 whitespace-nowrap rounded-md bg-asphalt px-3 py-1.5 text-xs text-white">{done}</p>}
    </div>
  );
}
