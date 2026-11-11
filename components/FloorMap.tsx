"use client";
// ===== Draws the slot map from layouts.json, painted like the deck =====
// · Bays = shared white divider lines, open on the aisle side (like painted bays on a real car-park floor)
// · Walls run together into one continuous band, the road is plain asphalt with a dashed centre line
// · Every map uses the same bay size (same scale) so floors can be compared. On a phone the bays shrink so the whole floor fits the screen
// mode:
//  "status" → coloured by state: free/taken/reserved   (lot home page, Admin slot status)
//  "select" → only free slots are clickable            (booking page)
//  "heat"   → more yellow the more the slot was used   (Report Activity)
//  "edit"   → every cell is clickable                   (layout editor)
// selected = the driver's slot / the slot being chosen → solid yellow (the only yellow on the map)
import type { Cell, CellType, Layout, SlotStatus } from "@/types";
import Icon from "./Icon";

type Props = {
  layout: Layout;
  mode?: "status" | "select" | "heat" | "edit";
  status?: Record<string, SlotStatus>;
  heat?: Record<string, number>;
  selected?: string | null;
  onCellClick?: (x: number, y: number, cell: Cell | undefined) => void;
};

const KIND_ICON = { ev: "ev", disabled: "disabled", moto: "moto" } as const;
const STATUS_WORD = { free: "ว่าง", busy: "มีรถ", reserved: "ถูกจอง" } as const;
const BAY = "2.75rem";   // bay width
const THIN = "0.75rem";  // thickness of a wall row/column

export default function FloorMap({ layout, mode = "status", status = {}, heat = {}, selected, onCellClick }: Props) {
  const byPos = new Map(layout.cells.map((c) => [`${c.x},${c.y}`, c]));
  const typeAt = (x: number, y: number): CellType => byPos.get(`${x},${y}`)?.type ?? "empty";
  const maxHeat = Math.max(1, ...Object.values(heat));
  const edit = mode === "edit";

  // A row/column that is only walls (or empty) gets drawn thin, so the walls read as the deck's edge
  const thinRow = (y: number) => !edit && Array.from({ length: layout.cols }, (_, x) => typeAt(x, y)).every((t) => t === "wall" || t === "empty");
  const thinCol = (x: number) => !edit && Array.from({ length: layout.rows }, (_, y) => typeAt(x, y)).every((t) => t === "wall" || t === "empty");
  const rows = Array.from({ length: layout.rows }, (_, y) => (thinRow(y) ? THIN : "3.5rem")).join(" ");
  const colsLg = Array.from({ length: layout.cols }, (_, x) => (thinCol(x) ? THIN : BAY)).join(" ");
  const colsSm = Array.from({ length: layout.cols }, (_, x) => `minmax(0, ${thinCol(x) ? THIN : BAY})`).join(" ");

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < layout.rows; y++) {
    for (let x = 0; x < layout.cols; x++) {
      const cell = byPos.get(`${x},${y}`);
      const type: CellType = cell?.type ?? "empty";
      const key = `${x},${y}`;
      let title = "";
      let body: React.ReactNode = null;
      let cls = "";
      let clickable = edit;

      if (type === "slot" && cell?.code) {
        const short = cell.code.split("-")[1] ?? cell.code;
        const icon = cell.kind && cell.kind !== "normal" ? KIND_ICON[cell.kind] : null;
        const st: SlotStatus = status[cell.code] ?? "free";
        // The open side of the bay faces the aisle: if the cell above is the road → open at the top, otherwise open at the bottom
        const openTop = typeAt(x, y - 1) === "road" || typeAt(x, y - 1) === "empty";
        const back = openTop ? "border-b-2" : "border-t-2";
        const rightEdge = typeAt(x + 1, y) !== "slot" ? "border-r-2" : "";
        const dashed = mode !== "heat" && !edit && st === "reserved" ? "border-dashed" : "";
        cls = `relative border-l-2 ${rightEdge} ${back} ${dashed} border-white/85`;

        // Fill inside the lines: taken = grey car block, selected = yellow, heat = yellow by how often it was used
        let fill = "";
        let text = "text-white";
        let style: React.CSSProperties | undefined;
        if (mode === "heat") {
          const used = heat[cell.code] ?? 0;
          const pct = Math.round((used / maxHeat) * 100);
          style = { background: `color-mix(in srgb, var(--color-paint) ${pct}%, var(--color-asphalt-2))` };
          text = pct > 55 ? "text-ink" : "text-white/85";
          title = `${cell.code}: ใช้ ${used} ครั้ง`;
        } else if (!edit) {
          if (st === "busy") { fill = "bg-asphalt-3"; text = "text-white/75"; }
          if (mode === "select" && st === "free") clickable = true;
          title = `${cell.code} · ${STATUS_WORD[st]}`;
        } else title = cell.code;
        if (selected === cell.code) { fill = "bg-paint"; text = "text-ink"; style = undefined; title += " · ช่องของคุณ"; }

        body = (
          <span className={`absolute inset-[3px] flex flex-col items-center justify-center gap-0.5 rounded-[2px] font-display text-[10px] font-semibold leading-none sm:text-[11px] ${fill} ${text}`} style={style}>
            {icon && <Icon name={icon} className="h-3 w-3" />}
            <span>{short}</span>
          </span>
        );
      } else if (type === "wall") {
        cls = "bg-asphalt-deep";
      } else if (type === "road") {
        // Dashed centre line in a horizontal aisle
        const lane = typeAt(x - 1, y) === "road" || typeAt(x + 1, y) === "road";
        cls = edit ? "bg-asphalt-2" : "relative";
        if (lane && !edit) body = <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-white/25" />;
      } else if (type === "entry" || type === "exit") {
        const exit = type === "exit";
        title = exit ? "ทางออก" : "ทางเข้า";
        cls = `m-[3px] flex flex-col items-center justify-center gap-0.5 rounded-[3px] font-display text-[10px] font-bold leading-none sm:text-[11px] ${exit ? "bg-ok text-white" : "bg-white text-ink"}`;
        body = <><Icon name="arrow" className={`h-3.5 w-3.5 ${exit ? "" : "rotate-180"}`} />{exit ? "ออก" : "เข้า"}</>;
      } else if (type === "lift") {
        title = "ลิฟต์";
        cls = "m-[3px] grid place-items-center rounded-[3px] bg-asphalt-deep font-display text-[10px] font-semibold text-white ring-1 ring-inset ring-white/40 sm:text-[11px]";
        body = "ลิฟต์";
      } else if (edit) {
        cls = "m-px border border-dashed border-white/15";
      }

      cells.push(
        clickable ? (
          <button key={key} type="button" title={title} aria-label={title || `ช่อง ${x + 1},${y + 1}`} onClick={() => onCellClick?.(x, y, cell)}
            className={`${cls} cursor-pointer transition-colors hover:bg-white/15`}>
            {body}
          </button>
        ) : (
          <div key={key} title={title || undefined} className={cls}>{body}</div>
        ),
      );
    }
  }

  return (
    <div className="max-w-full overflow-x-auto rounded-lg bg-asphalt p-2 sm:p-4">
      <div className="mx-auto grid w-full sm:w-max [grid-template-columns:var(--cols-sm)] sm:[grid-template-columns:var(--cols)]"
        style={{ "--cols": colsLg, "--cols-sm": colsSm, gridTemplateRows: rows } as React.CSSProperties}>
        {cells}
      </div>
    </div>
  );
}

export function FloorLegend({ mode = "status" }: { mode?: "status" | "heat" }) {
  if (mode === "heat")
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        ใช้น้อย
        <span className="flex h-3 w-28 overflow-hidden rounded-[3px]">
          {[0, 25, 50, 75, 100].map((p) => (
            <i key={p} className="flex-1" style={{ background: `color-mix(in srgb, var(--color-paint) ${p}%, var(--color-asphalt-2))` }} />
          ))}
        </span>
        ใช้บ่อย
      </div>
    );
  const bay = "inline-block h-5 w-4 bg-asphalt border-x-2 border-t-2 border-white";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
      <span className="flex items-center gap-1.5"><i className={`${bay} outline outline-1 outline-asphalt`} />ว่าง</span>
      <span className="flex items-center gap-1.5"><i className={`${bay} shadow-[inset_0_0_0_2px_var(--color-asphalt)] !bg-asphalt-3`} />มีรถ</span>
      <span className="flex items-center gap-1.5"><i className={`${bay} border-dashed outline outline-1 outline-asphalt`} />ถูกจอง</span>
      <span className="flex items-center gap-1.5"><i className="inline-block h-4 w-4 rounded-[3px] bg-paint" />ช่องของคุณ</span>
      <span className="flex items-center gap-1.5"><Icon name="ev" className="h-4 w-4" />ชาร์จไฟฟ้า</span>
      <span className="flex items-center gap-1.5"><Icon name="disabled" className="h-4 w-4" />ผู้พิการ</span>
      <span className="flex items-center gap-1.5"><Icon name="moto" className="h-4 w-4" />มอเตอร์ไซค์</span>
    </div>
  );
}
