"use client";
// Page /[lot]: the lot's home page
// Top band = the selected floor (big floor badge + free count + floor switch) next to plate search
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import FloorBadge from "@/components/FloorBadge";
import FloorMap, { FloorLegend } from "@/components/FloorMap";
import Icon, { type IconName } from "@/components/Icon";
import { useLots } from "@/context/LotContext";
import { getSlotStatus } from "@/lib/booking";
import { countByFloor, getLayout, getLot } from "@/lib/lots";
import { useNow } from "@/lib/storage";

// How full the floor is → words + colour (on the dark band)
function fullness(free: number, total: number) {
  const p = total ? free / total : 0;
  if (p > 0.3) return { p, word: "ว่างมาก", tone: "text-ok-lt" };
  if (p > 0) return { p, word: "ใกล้เต็ม", tone: "text-white" };
  return { p, word: "เต็ม", tone: "text-bad-lt" };
}

export default function LotHomePage() {
  const { lot: lotId } = useParams<{ lot: string }>();
  const router = useRouter();
  const { lots, layouts, bookings } = useLots();
  const lot = getLot(lotId, lots)!;
  const now = useNow();
  const [plate, setPlate] = useState("");
  const [floor, setFloor] = useState(lot.floors[0]);

  const status = now ? getSlotStatus(lot.id, layouts, bookings, now) : {};
  const floors = countByFloor(lot, layouts, status);
  const layout = getLayout(lot.id, floor, layouts);
  const fi = Math.max(0, lot.floors.indexOf(floor));
  const cur = floors[fi] ?? { free: 0, total: 0 };
  const curState = fullness(cur.free, cur.total);
  const floorCount = { free: 0, busy: 0, reserved: 0 };
  layout?.cells.forEach((c) => { if (c.type === "slot" && c.code) floorCount[status[c.code] ?? "free"]++; });
  const allFree = floors.reduce((a, f) => a + f.free, 0);
  const allTotal = floors.reduce((a, f) => a + f.total, 0);

  const actions: { href: string; icon: IconName; title: string; text: string }[] = [
    { href: `/${lot.id}/pay`, icon: "qr", title: "ชำระค่าจอด", text: "ค้นหาจากทะเบียน จ่ายด้วย ThaiQR" },
    { href: `/${lot.id}/book`, icon: "calendar", title: "จองที่จอดล่วงหน้า", text: `เลือกช่องเอง ค่าบริการ ${lot.rates.bookingFee} บาท` },
    { href: `/${lot.id}/history`, icon: "receipt", title: "ประวัติและใบเสร็จ", text: "ดูการจอง แก้เวลา ใบเสร็จย้อนหลัง" },
  ];

  return (
    <div className="grid gap-8">
      {/* ===== The selected floor + search ===== */}
      <section className="-mx-4 -mt-6 grid gap-8 bg-asphalt px-4 py-7 text-white sm:mx-0 sm:mt-0 sm:rounded-lg sm:p-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8">
        <div className="grid content-start gap-5">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{lot.name}</h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
              <span className="flex items-center gap-1.5"><Icon name="pin" className="h-4 w-4" />{lot.address}</span>
              <span className="flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4" />เปิด {lot.openHours}</span>
            </p>
          </div>

          <div className="flex items-center gap-5 sm:gap-7">
            <FloorBadge floor={floor} index={fi} size="xl" />
            <div className="grid gap-1">
              <span className={`font-display text-lg font-semibold ${now ? curState.tone : "text-white/70"}`}>
                ชั้น {floor} · {now ? curState.word : "กำลังโหลด"}
              </span>
              <p className="num font-display text-6xl font-bold leading-none sm:text-7xl">
                {now ? cur.free : "–"}<span className="text-2xl font-semibold text-white/70"> / {cur.total} ช่องว่าง</span>
              </p>
              <span className="num text-sm text-white/80">
                {now ? `ทั้งลานว่าง ${allFree} จาก ${allTotal} ช่อง · อัปเดต ${now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}` : " "}
              </span>
            </div>
          </div>

          {/* Floor switch */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกชั้น">
            {floors.map((f, i) => {
              const s = fullness(f.free, f.total);
              const on = f.floor === floor;
              return (
                <button key={f.floor} type="button" onClick={() => setFloor(f.floor)} aria-pressed={on}
                  className={`flex items-center gap-2.5 rounded-md py-1.5 pl-1.5 pr-3.5 text-left transition-colors ${on ? "bg-white text-ink" : "bg-asphalt-2 text-white hover:bg-asphalt-3"}`}>
                  <FloorBadge floor={f.floor} index={i} size="sm" />
                  <span className="grid leading-tight">
                    <b className="num font-display text-lg">{now ? f.free : "–"}<span className={`text-sm font-medium ${on ? "text-muted" : "text-white/70"}`}> / {f.total}</span></b>
                    <span className={`text-sm ${on ? "text-muted" : s.tone}`}>{now ? s.word : " "}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form className="grid content-start gap-3 lg:border-l lg:border-white/15 lg:pl-8"
          onSubmit={(e) => { e.preventDefault(); router.push(`/${lot.id}/pay?plate=${encodeURIComponent(plate)}`); }}>
          <label htmlFor="home-plate" className="font-display text-xl font-semibold">ค้นหารถ / ชำระค่าจอด</label>
          <input id="home-plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="กรอกทะเบียน เช่น กข 1234"
            className="h-14 w-full rounded-md px-4 font-display text-xl text-ink" autoComplete="off" />
          <button className="flex h-14 items-center justify-center gap-2 rounded-md bg-paint font-display text-lg font-bold text-ink transition-colors hover:bg-paint-hi">
            <Icon name="search" />ค้นหา
          </button>
          <dl className="num mt-2 grid grid-cols-3 gap-3 border-t border-white/15 pt-4 text-center">
            <div><dt className="text-sm text-white/80">{lot.rates.freeMinutes} นาทีแรก</dt><dd className="font-display text-xl font-bold">ฟรี</dd></div>
            <div><dt className="text-sm text-white/80">ต่อชั่วโมง</dt><dd className="font-display text-xl font-bold">{lot.rates.perHour} ฿</dd></div>
            <div><dt className="text-sm text-white/80">สูงสุด/วัน</dt><dd className="font-display text-xl font-bold">{lot.rates.dayMax} ฿</dd></div>
          </dl>
          <p className="text-sm text-white/80">เศษของชั่วโมงคิดเป็น 1 ชั่วโมง</p>
        </form>
      </section>

      {/* ===== Map of the selected floor ===== */}
      {layout && (
        <section className="grid gap-4" aria-labelledby="map-title">
          <h2 id="map-title" className="flex items-center gap-3 text-2xl font-bold">
            <FloorBadge floor={floor} index={fi} size="md" />ผังชั้น {floor}
          </h2>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div key={floor} className="deck-in">
              <FloorMap layout={layout} status={status} />
            </div>
            <aside className="grid gap-5 rounded-md border border-line bg-white p-5">
              <p className="num text-sm text-muted">
                {now ? <>ชั้น {floor}: มีรถ {floorCount.busy} · ถูกจอง {floorCount.reserved} · ว่าง <b className="text-ink">{floorCount.free}</b> ช่อง</> : "กำลังโหลด…"}
              </p>
              <div className="grid gap-2 border-t border-line pt-4">
                <h3 className="text-base font-bold">สัญลักษณ์ในผัง</h3>
                <FloorLegend />
              </div>
              <Link href={`/${lot.id}/book`} className="flex items-center justify-between gap-3 rounded-md bg-asphalt px-4 py-3 font-display font-semibold text-white hover:bg-asphalt-2">
                อยากได้ช่องแน่นอน? จองล่วงหน้า<Icon name="arrow" className="h-5 w-5 text-paint" />
              </Link>
            </aside>
          </div>
        </section>
      )}

      {/* ===== Things you can do + contacts ===== */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-3">
          <h2 className="text-xl font-bold">ทำอะไรได้บ้าง</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-lg bg-white shadow-card">
            {actions.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-paint-soft">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-asphalt text-paint"><Icon name={a.icon} /></span>
                  <span className="grid min-w-0 flex-1">
                    <b className="font-display text-lg">{a.title}</b>
                    <span className="text-sm text-muted">{a.text}</span>
                  </span>
                  <Icon name="arrow" className="h-5 w-5 text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-3">
          <h2 className="text-xl font-bold">ติดต่อลานจอด</h2>
          <div className="grid gap-3 rounded-lg bg-white shadow-card p-5">
          <p className="flex items-center gap-2 text-sm text-muted"><Icon name="phone" className="h-4 w-4" />ติดต่อเจ้าหน้าที่ <a href={`tel:${lot.phone}`} className="num font-semibold text-ink underline">{lot.phone}</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
