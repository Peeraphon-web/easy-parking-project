"use client";
// หน้า /admin/layout-editor: ออกแบบผังช่องจอดแบบตาราง (Super Admin)
// เลือกเครื่องมือ → คลิกช่องบนผัง → บันทึก (เก็บใน localStorage ผ่าน LotContext)
import { useEffect, useState } from "react";
import FloorBadge from "@/components/FloorBadge";
import FloorMap from "@/components/FloorMap";
import PageHeader from "@/components/PageHeader";
import { useLots } from "@/context/LotContext";
import { getLayout, getLot } from "@/lib/lots";
import type { Cell, CellType, Layout, SlotKind } from "@/types";

type Tool = { type: CellType; kind?: SlotKind; label: string; swatch: string };
// swatch = the same colours as the cells in FloorMap
const SLOT = "bg-asphalt border-2 border-white outline outline-1 outline-asphalt";
const TOOLS: Tool[] = [
  { type: "slot", kind: "normal", label: "ช่องจอด", swatch: SLOT },
  { type: "slot", kind: "ev", label: "ช่องรถไฟฟ้า (EV)", swatch: SLOT },
  { type: "slot", kind: "disabled", label: "ช่องผู้พิการ", swatch: SLOT },
  { type: "slot", kind: "moto", label: "มอเตอร์ไซค์", swatch: SLOT },
  { type: "road", label: "ทางเดินรถ", swatch: "bg-asphalt-2" },
  { type: "wall", label: "ผนัง", swatch: "bg-asphalt-deep" },
  { type: "entry", label: "ทางเข้า", swatch: "bg-white border border-ink" },
  { type: "exit", label: "ทางออก", swatch: "bg-ok" },
  { type: "lift", label: "ลิฟต์", swatch: "bg-asphalt-deep ring-1 ring-inset ring-white/60" },
  { type: "empty", label: "ยางลบ", swatch: "border border-dashed border-ink/40" },
];

// ตั้งรหัสช่องใหม่ทั้งชั้น: เรียงตามแถว แถวละตัวอักษร A, B, C...
function renumber(layout: Layout): Layout {
  const rows = [...new Set(layout.cells.filter((c) => c.type === "slot").map((c) => c.y))].sort((a, b) => a - b);
  const cells = layout.cells.map((c) => {
    if (c.type !== "slot") return c;
    const letter = String.fromCharCode(65 + rows.indexOf(c.y));
    return { ...c, code: `${layout.floor}-${letter}${String(c.x).padStart(2, "0")}` };
  });
  return { ...layout, cells };
}

export default function LayoutEditorPage() {
  const { lots, layouts, setLayouts, adminLotId } = useLots();
  const lot = getLot(adminLotId, lots);
  const [floor, setFloor] = useState("");
  const [draft, setDraft] = useState<Layout | null>(null);
  const [tool, setTool] = useState(0);
  const [saved, setSaved] = useState(true);

  const current = lot && lot.floors.includes(floor) ? floor : lot?.floors[0] ?? "";

  // โหลดผังเมื่อเปลี่ยนลานหรือชั้น
  useEffect(() => {
    if (!lot) return;
    setDraft(getLayout(lot.id, current, layouts) ?? { lotId: lot.id, floor: current, cols: 10, rows: 6, cells: [] });
    setSaved(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lot?.id, current]);

  if (!lot || !draft) return <p className="text-muted">กำลังโหลด…</p>;

  function paint(x: number, y: number) {
    const t = TOOLS[tool];
    setDraft((d) => {
      if (!d) return d;
      const rest = d.cells.filter((c) => !(c.x === x && c.y === y));
      const cell: Cell | null = t.type === "empty" ? null : { x, y, type: t.type, ...(t.kind ? { kind: t.kind, code: "" } : {}) };
      return renumber({ ...d, cells: cell ? [...rest, cell] : rest });
    });
    setSaved(false);
  }

  function resize(cols: number, rows: number) {
    setDraft((d) => d && renumber({ ...d, cols, rows, cells: d.cells.filter((c) => c.x < cols && c.y < rows) }));
    setSaved(false);
  }

  function save() {
    setLayouts((prev) => [...prev.filter((l) => !(l.lotId === draft!.lotId && l.floor === draft!.floor)), draft!]);
    setSaved(true);
  }

  const slots = draft.cells.filter((c) => c.type === "slot").length;
  const field = "w-20 rounded-lg border border-ink/35 px-2 py-1.5";

  return (
    <>
      <PageHeader title="ออกแบบผังช่องจอด" subtitle={`${lot.name} · ชั้น ${current} · ${slots} ช่องจอด`}>
        <button type="button" onClick={save} disabled={saved}
          className="rounded-md bg-paint hover:bg-paint-hi px-5 py-2 font-display font-semibold text-ink disabled:opacity-40">{saved ? "บันทึกแล้ว" : "บันทึกผัง"}</button>
      </PageHeader>

      <div className="flex flex-wrap items-end gap-4 rounded-lg bg-white shadow-card p-4">
        <div className="flex flex-wrap gap-1.5">
          {lot.floors.map((f) => (
            <button key={f} type="button" onClick={() => setFloor(f)} aria-pressed={f === current} className={`flex items-center gap-2 rounded-md py-1 pl-1 pr-3 text-sm font-semibold ${f === current ? "bg-asphalt text-white" : "border border-line bg-white hover:border-ink"}`}><FloorBadge floor={f} index={lot.floors.indexOf(f)} size="xs" />ชั้น {f}</button>
          ))}
        </div>
        <label className="grid gap-1 text-xs text-muted">คอลัมน์
          <input id="ed-cols" type="number" min={4} max={30} value={draft.cols} onChange={(e) => resize(Math.min(30, Math.max(4, Number(e.target.value))), draft.rows)} className={field} />
        </label>
        <label className="grid gap-1 text-xs text-muted">แถว
          <input id="ed-rows" type="number" min={3} max={20} value={draft.rows} onChange={(e) => resize(draft.cols, Math.min(20, Math.max(3, Number(e.target.value))))} className={field} />
        </label>
        <button type="button" onClick={() => { setDraft({ ...draft, cells: [] }); setSaved(false); }} className="self-end rounded-md border border-bad/40 bg-white px-3 py-2 text-sm font-semibold text-bad hover:bg-bad/5">ล้างทั้งชั้น</button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[220px_1fr]">
        <div className="grid gap-1.5 rounded-lg bg-white shadow-card p-3">
          <p className="px-1 pb-1 text-sm font-semibold">เครื่องมือ</p>
          {TOOLS.map((t, i) => (
            <button key={t.label} type="button" onClick={() => setTool(i)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${tool === i ? "bg-paint font-semibold text-ink" : "hover:bg-surface"}`}>
              <i className={`h-4 w-4 shrink-0 rounded-[3px] ${t.swatch}`} />{t.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 rounded-lg bg-white shadow-card p-4">
          <p className="text-sm text-muted">คลิกช่องบนผังเพื่อวาดด้วยเครื่องมือที่เลือก รหัสช่องจอดจะตั้งให้อัตโนมัติ (แถวบนสุด = A)</p>
          <FloorMap layout={draft} mode="edit" onCellClick={paint} />
        </div>
      </div>
    </>
  );
}
