// ===== ส่งออกรายงาน: CSV (เปิดใน Excel ได้ ภาษาไทยไม่เพี้ยน) และพิมพ์ / บันทึกเป็น PDF =====

export type Column<T> = { header: string; value: (row: T) => string | number | null | undefined };

// ใส่เครื่องหมายคำพูดเมื่อมี , " หรือขึ้นบรรทัดใหม่ ตามมาตรฐาน CSV
function cell(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV<T>(rows: T[], columns: Column<T>[]): string {
  const head = columns.map((c) => cell(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => cell(c.value(r))).join(","));
  return [head, ...body].join("\r\n");
}

// ดาวน์โหลดไฟล์ CSV · ใส่ BOM (﻿) ไว้หน้าไฟล์ ไม่งั้น Excel อ่านภาษาไทยเป็นภาษาต่างดาว
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// วันเวลาแบบที่ Excel จัดเรียงได้: 2026-11-11 14:05
export function csvDateTime(iso: string | Date): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ชื่อไฟล์: easy-parking_finance_easy-mall_2026-11-11.csv
export function reportName(kind: string, lotId: string): string {
  return `easy-parking_${kind}_${lotId}_${csvDateTime(new Date()).slice(0, 10)}`;
}

// เปิดหน้าต่างพิมพ์ของเบราว์เซอร์ (เลือก "บันทึกเป็น PDF" ได้) · ส่วนที่ไม่ต้องพิมพ์ซ่อนด้วย CSS @media print
export function printReport(): void {
  window.print();
}
