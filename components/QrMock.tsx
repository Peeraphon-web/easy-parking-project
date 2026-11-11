// ภาพ ThaiQR จำลอง (ลายสุ่มคงที่จาก seed) ใช้ในหน้าชำระเงินและตู้ Kiosk
export default function QrMock({ seed, size = 200 }: { seed: string; size?: number }) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => ((h = (h * 1103515245 + 12345) >>> 0) / 4294967296);
  const N = 25;
  const finder = (x: number, y: number) =>
    [[0, 0], [N - 7, 0], [0, N - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const finderOn = (x: number, y: number) => {
    const [fx, fy] = [[0, 0], [N - 7, 0], [0, N - 7]].find(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)!;
    const dx = x - fx, dy = y - fy;
    return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
  };
  const rects: React.ReactNode[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const on = finder(x, y) ? finderOn(x, y) : rand() < 0.5;
      if (on) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  return (
    <div className="grid justify-items-center gap-2">
      <span className="rounded bg-[#113566] px-3 py-1 font-display text-xs font-semibold text-white">THAI QR PAYMENT</span>
      <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} width={size} height={size} className="rounded-lg bg-white" shapeRendering="crispEdges" role="img" aria-label="QR จำลอง">
        <g fill="#111">{rects}</g>
      </svg>
      <span className="text-xs text-muted">QR จำลองสำหรับสาธิต</span>
    </div>
  );
}
