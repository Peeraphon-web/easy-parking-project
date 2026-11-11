"use client";
// หน้า /admin/finance: Report Finance — รายรับรายวัน / รายเดือน / ตามชั่วโมง (Chart.js)
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import ExportMenu from "@/components/ExportMenu";
import PageHeader from "@/components/PageHeader";
import Stat, { StatBar } from "@/components/Stat";
import { useAuth } from "@/context/AuthContext";
import { useLots } from "@/context/LotContext";
import { getLot } from "@/lib/lots";
import { csvDateTime, downloadCSV, reportName, toCSV } from "@/lib/export";
import { formatBaht, formatDate, formatTime, minutesBetween } from "@/lib/parking";
import type { Payment } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
// Charts use the site's font and colours
if (typeof document !== "undefined") ChartJS.defaults.font.family = getComputedStyle(document.body).fontFamily;
ChartJS.defaults.color = "#595d65";
ChartJS.defaults.borderColor = "#e3e4df";

type View = "day" | "month" | "hour";

export default function FinancePage() {
  const { admin } = useAuth();
  const { lots, payments, adminLotId } = useLots();
  const lot = getLot(adminLotId, lots);
  const [view, setView] = useState<View>("day");
  const [allLots, setAllLots] = useState(false);
  if (!lot) return null;

  const scope = allLots && admin?.role === "super" ? payments : payments.filter((p) => p.lotId === lot.id);
  const total = scope.reduce((a, p) => a + p.amount, 0);

  // รวมยอดตามกลุ่ม
  const groups = new Map<string, number>();
  const keyOf = (iso: string) => (view === "day" ? iso.slice(0, 10) : view === "month" ? iso.slice(0, 7) : iso.slice(11, 13));
  [...scope].reverse().forEach((p) => groups.set(keyOf(p.timeOut), (groups.get(keyOf(p.timeOut)) ?? 0) + p.amount));
  let labels = [...groups.keys()];
  if (view === "day") labels = labels.slice(-30);
  if (view === "hour") labels = labels.sort();
  const values = labels.map((k) => groups.get(k) ?? 0);

  // ---------- ส่งออกรายงาน ----------
  const scopeId = allLots && admin?.role === "super" ? "all" : lot.id;
  const lotName = (id: string) => lots.find((l) => l.id === id)?.name ?? id;
  const viewTh = view === "day" ? "รายวัน" : view === "month" ? "รายเดือน" : "ตามชั่วโมง";

  function exportTransactions() {
    const csv = toCSV<Payment>(scope, [
      { header: "เลขที่ใบเสร็จ", value: (p) => p.ref },
      { header: "สถานที่", value: (p) => lotName(p.lotId) },
      { header: "ทะเบียน", value: (p) => p.plate },
      { header: "ประเภทรถ", value: (p) => p.carType },
      { header: "ช่องจอด", value: (p) => p.slot },
      { header: "เวลาเข้า", value: (p) => csvDateTime(p.timeIn) },
      { header: "เวลาออก", value: (p) => csvDateTime(p.timeOut) },
      { header: "เวลาจอด (นาที)", value: (p) => minutesBetween(p.timeIn, p.timeOut) },
      { header: "ค่าจอด (บาท)", value: (p) => p.amount - (p.bookingFee ?? 0) },
      { header: "ค่าบริการจอง (บาท)", value: (p) => p.bookingFee ?? 0 },
      { header: "ยอดรวม (บาท)", value: (p) => p.amount },
      { header: "ช่องทางชำระ", value: (p) => (p.method === "Cash" ? "เงินสด" : "ThaiQR") },
    ]);
    downloadCSV(reportName("finance-transactions", scopeId), csv);
  }

  function exportSummary() {
    const count = new Map<string, number>();
    scope.forEach((p) => count.set(keyOf(p.timeOut), (count.get(keyOf(p.timeOut)) ?? 0) + 1));
    const keys = [...groups.keys()].sort();
    const csv = toCSV(keys, [
      { header: view === "day" ? "วันที่" : view === "month" ? "เดือน" : "ชั่วโมง", value: (k) => (view === "hour" ? `${k}:00` : k) },
      { header: "จำนวนรายการ", value: (k) => count.get(k) ?? 0 },
      { header: "รายรับ (บาท)", value: (k) => groups.get(k) ?? 0 },
    ]) + `\r\nรวม,${scope.length},${total}`;
    downloadCSV(reportName(`finance-summary-${view}`, scopeId), csv);
  }

  // เทียบแต่ละสถานที่ (Super Admin)
  const byLot = lots.map((l) => ({ name: l.name, sum: payments.filter((p) => p.lotId === l.id).reduce((a, p) => a + p.amount, 0) }));

  return (
    <>
      <PageHeader title="Report Finance" subtitle={allLots ? "ทุกสถานที่" : lot.name}>
        {(["day", "month", "hour"] as View[]).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)}
            className={`rounded-md px-3 py-2 text-sm ${view === v ? "bg-asphalt text-white" : "border border-line bg-white"}`}>
            {v === "day" ? "รายวัน" : v === "month" ? "รายเดือน" : "ตามชั่วโมง"}
          </button>
        ))}
        {admin?.role === "super" && (
          <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
            <input id="fin-all" type="checkbox" checked={allLots} onChange={(e) => setAllLots(e.target.checked)} />ทุกสถานที่
          </label>
        )}
        <ExportMenu items={[
          { label: `สรุปรายรับ${viewTh} (CSV)`, note: `ยอดรวมและจำนวนรายการ แยก${viewTh}`, onSelect: exportSummary },
          { label: "รายการชำระเงินทั้งหมด (CSV)", note: `${scope.length.toLocaleString()} รายการ แยกค่าจอดและค่าบริการจอง`, onSelect: exportTransactions },
        ]} />
      </PageHeader>
      <p className="print-only text-sm text-muted">Easy Parking · Report Finance · {allLots ? "ทุกสถานที่" : lot.name}</p>

      <StatBar>
        <Stat label="รายรับรวม" value={formatBaht(total)} note={`${scope.length.toLocaleString()} รายการ`} />
        <Stat label="เฉลี่ยต่อคัน" value={formatBaht(Math.round(total / Math.max(1, scope.length)))} />
        <Stat label="ชำระผ่าน ThaiQR" value={`${Math.round((scope.filter((p) => p.method === "ThaiQR").length / Math.max(1, scope.length)) * 100)}%`} />
        <Stat label="จอดฟรี (ไม่เกินเวลาฟรี)" value={scope.filter((p) => p.amount === 0).length} note="รายการ" />
      </StatBar>

      <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
        <h2 className="text-xl font-bold">รายรับ{view === "day" ? " 30 วันล่าสุด" : view === "month" ? "รายเดือน" : "ตามชั่วโมงที่รถออก"} (บาท)</h2>
        <div className="h-72">
          <Bar
            data={{ labels: view === "hour" ? labels.map((h) => `${h}:00`) : labels, datasets: [{ label: "รายรับ (บาท)", data: values, backgroundColor: "#26282c", hoverBackgroundColor: "#f2c230", borderRadius: 2 }] }}
            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
          />
        </div>
      </section>

      {admin?.role === "super" && (
        <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
          <h2 className="text-xl font-bold">เปรียบเทียบแต่ละสถานที่</h2>
          {byLot.map((b) => (
            <div key={b.name} className="grid grid-cols-[minmax(0,180px)_1fr_auto] items-center gap-3 text-sm">
              <span className="truncate">{b.name}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-asphalt" style={{ width: `${(b.sum / Math.max(1, ...byLot.map((x) => x.sum))) * 100}%` }} /></div>
              <span className="num">{formatBaht(b.sum)}</span>
            </div>
          ))}
        </section>
      )}

      <section className="rounded-lg bg-white shadow-card p-5">
        <h2 className="mb-3 text-lg text-ink">รายการล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="num w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="py-2">เลขที่</th><th>ทะเบียน</th><th>วันที่</th><th>เวลาออก</th><th>ช่องทาง</th><th className="text-right">ยอด</th></tr></thead>
            <tbody>
              {scope.slice(0, 15).map((p) => (
                <tr key={p.ref} className="border-t border-line">
                  <td className="py-2.5">{p.ref}</td><td>{p.plate}</td><td>{formatDate(p.timeOut)}</td><td>{formatTime(p.timeOut)}</td>
                  <td>{p.method === "Cash" ? "เงินสด" : "ThaiQR"}</td><td className="text-right font-semibold">{formatBaht(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
