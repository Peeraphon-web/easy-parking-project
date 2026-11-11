"use client";
// หน้า /admin/activity: Report Activity — รถเข้าตามชั่วโมง, ประเภทรถ, Heat map, รายการเข้า-ออก
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import FloorBadge from "@/components/FloorBadge";
import FloorMap, { FloorLegend } from "@/components/FloorMap";
import ExportMenu from "@/components/ExportMenu";
import PageHeader from "@/components/PageHeader";
import Stat, { StatBar } from "@/components/Stat";
import { useLots } from "@/context/LotContext";
import { getLayout, getLot } from "@/lib/lots";
import { csvDateTime, downloadCSV, reportName, toCSV } from "@/lib/export";
import { formatDate, formatDuration, formatTime, minutesBetween } from "@/lib/parking";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
// Charts use the site's font and colours
if (typeof document !== "undefined") ChartJS.defaults.font.family = getComputedStyle(document.body).fontFamily;
ChartJS.defaults.color = "#595d65";
ChartJS.defaults.borderColor = "#e3e4df";

// Asphalt shades (the floor-level colours are kept for floors only)
const TYPE_COLORS = ["#26282c", "#4a4e55", "#7a7e86", "#a9acb2", "#d6d7d2"];

export default function ActivityPage() {
  const { lots, layouts, payments, adminLotId } = useLots();
  const lot = getLot(adminLotId, lots);
  const [days, setDays] = useState(7);
  const [floor, setFloor] = useState<string | null>(null);
  if (!lot) return null;

  const lotPays = payments.filter((p) => p.lotId === lot.id);
  const last = lotPays[0]?.timeOut ?? "";
  const since = last ? new Date(new Date(last).getTime() - days * 86400000).toISOString() : "";
  const scope = lotPays.filter((p) => p.timeOut >= since);

  const hours = Array.from({ length: 24 }, (_, h) => scope.filter((p) => Number(p.timeIn.slice(11, 13)) === h).length);
  const peak = hours.indexOf(Math.max(...hours));
  const typeCount = new Map<string, number>();
  scope.forEach((p) => typeCount.set(p.carType, (typeCount.get(p.carType) ?? 0) + 1));
  const heat: Record<string, number> = {};
  scope.forEach((p) => (heat[p.slot] = (heat[p.slot] ?? 0) + 1));
  const avg = Math.round(scope.reduce((a, p) => a + minutesBetween(p.timeIn, p.timeOut), 0) / Math.max(1, scope.length));

  // ---------- ส่งออกรายงาน ----------
  function exportEntries() {
    const csv = toCSV(scope, [
      { header: "ทะเบียน", value: (p) => p.plate },
      { header: "ประเภทรถ", value: (p) => p.carType },
      { header: "ช่องจอด", value: (p) => p.slot },
      { header: "เวลาเข้า", value: (p) => csvDateTime(p.timeIn) },
      { header: "เวลาออก", value: (p) => csvDateTime(p.timeOut) },
      { header: "เวลาจอด (นาที)", value: (p) => minutesBetween(p.timeIn, p.timeOut) },
    ]);
    downloadCSV(reportName(`activity-entries-${days}d`, lot!.id), csv);
  }

  function exportHourly() {
    const types = [...typeCount.keys()].sort();
    const rows = hours.map((n, h) => ({ h, n }));
    const csv = toCSV(rows, [
      { header: "ช่วงเวลาเข้า", value: (r) => `${String(r.h).padStart(2, "0")}:00–${String(r.h + 1).padStart(2, "0")}:00` },
      { header: "จำนวนรถเข้า", value: (r) => r.n },
      ...types.map((t) => ({ header: t, value: (r: { h: number }) => scope.filter((p) => p.carType === t && Number(p.timeIn.slice(11, 13)) === r.h).length })),
    ]);
    downloadCSV(reportName(`activity-hourly-${days}d`, lot!.id), csv);
  }

  function exportSlots() {
    const rows = layouts
      .filter((l) => l.lotId === lot!.id)
      .flatMap((l) => l.cells.filter((c) => c.type === "slot" && c.code).map((c) => ({ floor: l.floor, code: c.code!, kind: c.kind ?? "normal" })))
      .sort((a, b) => (heat[b.code] ?? 0) - (heat[a.code] ?? 0));
    const kindTh: Record<string, string> = { normal: "ทั่วไป", ev: "รถไฟฟ้า", disabled: "ผู้พิการ", moto: "มอเตอร์ไซค์" };
    const csv = toCSV(rows, [
      { header: "ชั้น", value: (r) => r.floor },
      { header: "ช่องจอด", value: (r) => r.code },
      { header: "ประเภทช่อง", value: (r) => kindTh[r.kind] ?? r.kind },
      { header: `จำนวนครั้งที่ใช้ (${days} วัน)`, value: (r) => heat[r.code] ?? 0 },
    ]);
    downloadCSV(reportName(`activity-slots-${days}d`, lot!.id), csv);
  }

  const current = floor && lot.floors.includes(floor) ? floor : lot.floors[0];
  const layout = getLayout(lot.id, current, layouts);

  return (
    <>
      <PageHeader title="Report Activity" subtitle={`${lot.name} · ${days} วันล่าสุดที่มีข้อมูล`}>
        <label className="flex items-center gap-2 text-sm">ช่วงเวลา
          <select id="act-days" value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-md border border-ink/35 bg-white px-3 py-2">
            {[1, 7, 14, 30, 60].map((d) => <option key={d} value={d}>{d} วัน</option>)}
          </select>
        </label>
        <ExportMenu items={[
          { label: "รายการรถเข้า-ออก (CSV)", note: `${scope.length.toLocaleString()} คัน ใน ${days} วัน`, onSelect: exportEntries },
          { label: "สรุปรายชั่วโมง + ประเภทรถ (CSV)", note: "จำนวนรถเข้าแต่ละชั่วโมง แยกประเภทรถ", onSelect: exportHourly },
          { label: "การใช้งานแต่ละช่องจอด (CSV)", note: "ข้อมูลเดียวกับ Heat map เรียงจากใช้บ่อยสุด", onSelect: exportSlots },
        ]} />
      </PageHeader>
      <p className="print-only text-sm text-muted">Easy Parking · Report Activity · {lot.name} · {days} วันล่าสุด</p>

      <StatBar>
        <Stat label="รถเข้า-ออก" value={scope.length.toLocaleString()} note="คัน" />
        <Stat label="ช่วงหนาแน่นสุด" value={`${peak}:00–${peak + 1}:00`} />
        <Stat label="เวลาจอดเฉลี่ย" value={formatDuration(avg)} />
        <Stat label="ประเภทที่มากสุด" value={[...typeCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "–"} />
      </StatBar>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
          <h2 className="text-xl font-bold">จำนวนรถเข้าตามชั่วโมง</h2>
          <div className="h-64">
            <Bar
              data={{ labels: hours.map((_, h) => `${h}`), datasets: [{ label: "รถเข้า (คัน)", data: hours, backgroundColor: hours.map((_, h) => (h === peak ? "#f2c230" : "#26282c")), borderRadius: 2 }] }}
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          </div>
        </section>
        <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
          <h2 className="text-xl font-bold">ประเภทรถ</h2>
          <div className="mx-auto h-64 w-full max-w-xs">
            <Doughnut
              data={{ labels: [...typeCount.keys()], datasets: [{ data: [...typeCount.values()], backgroundColor: TYPE_COLORS }] }}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
            />
          </div>
        </section>
      </div>

      <section className="grid gap-3 rounded-lg bg-white shadow-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Heat map ช่องจอด</h2>
          <div className="flex flex-wrap items-center gap-2">
            {lot.floors.map((f) => (
              <button key={f} type="button" onClick={() => setFloor(f)} aria-pressed={f === current} className={`flex items-center gap-2 rounded-md py-1 pl-1 pr-3 text-sm font-semibold ${f === current ? "bg-asphalt text-white" : "border border-line bg-white hover:border-ink"}`}><FloorBadge floor={f} index={lot.floors.indexOf(f)} size="xs" />ชั้น {f}</button>
            ))}
            <FloorLegend mode="heat" />
          </div>
        </div>
        {layout && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <FloorMap layout={layout} mode="heat" heat={heat} />
            <div className="grid gap-2">
              <h3 className="text-base font-bold">ช่องที่ใช้บ่อยสุด · ชั้น {current}</h3>
              <ol className="num divide-y divide-line rounded-md border border-line">
                {layout.cells.filter((c) => c.type === "slot" && c.code).map((c) => c.code!)
                  .sort((a, b) => (heat[b] ?? 0) - (heat[a] ?? 0)).slice(0, 6).map((code, i) => (
                    <li key={code} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span><span className="mr-2 text-muted">{i + 1}.</span><b className="font-display">{code}</b></span>
                      <span>{heat[code] ?? 0} ครั้ง</span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg bg-white shadow-card p-5">
        <h2 className="mb-3 text-xl font-bold">รายการรถเข้า-ออกล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="num w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="py-2">ทะเบียน</th><th>ประเภท</th><th>วันที่</th><th>เข้า</th><th>ออก</th><th>ช่อง</th></tr></thead>
            <tbody>
              {scope.slice(0, 15).map((p) => (
                <tr key={p.ref} className="border-t border-line">
                  <td className="py-2.5 font-semibold">{p.plate}</td><td>{p.carType}</td><td>{formatDate(p.timeIn)}</td>
                  <td>{formatTime(p.timeIn)}</td><td>{formatTime(p.timeOut)}</td><td>{p.slot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
