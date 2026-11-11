// Summary figure on Admin pages. Put it inside <StatBar> (one panel split by hairlines)
// tone = small colour square in front of the label (paint = yellow, as on a car-park floor)
type Tone = "paint" | "ok" | "warn" | "bad" | "plain";
const TONE: Record<Tone, string> = {
  paint: "bg-paint",
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
  plain: "bg-asphalt-3",
};

export default function Stat({ label, value, note, tone = "plain" }: { label: string; value: React.ReactNode; note?: string; tone?: Tone }) {
  return (
    <div className="grid content-start gap-1 bg-white p-4 sm:px-5">
      <span className="flex items-center gap-2 text-sm text-muted"><i className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ${TONE[tone]}`} />{label}</span>
      <b className="num font-display text-3xl font-bold leading-tight text-ink">{value}</b>
      {note && <span className="text-sm text-muted">{note}</span>}
    </div>
  );
}

// Row of summary figures: one panel split by thin lines (like the readout bar on the exit kiosk)
export function StatBar({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line shadow-card lg:grid-cols-4">{children}</div>;
}
