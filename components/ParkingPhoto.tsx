"use client";
// รูปลานจอด: ใช้รูปจริงจาก public/ ถ้ามี · ถ้ายังไม่มีไฟล์ จะวาดฉากด้วย CSS แทน (ไม่มีกรอบรูปเสีย)
// scene="mall"  → ลานจอดในอาคารห้าง หลายชั้น (เช่น เซ็นทรัลเวิลด์)
// scene="condo" → ลานจอดกลางแจ้งหน้าตึกคอนโด (เช่น พลัม คอนโด)
// fit="contain" ใช้กับภาพประกอบพื้นโปร่งใส (ไม่ครอบตัด)
// ใส่รูปจริงได้ที่ public/images/hero.png และ public/images/lots/<รหัสสถานที่>.jpg
import { useState } from "react";

const PILLAR = ["#2f6db5", "#c2521c", "#2c7a4b", "#6b4bb8"]; // สีชั้น ตรงกับ --color-lvl-*

type Props = { src: string; alt: string; scene?: "mall" | "condo"; variant?: number; className?: string; fit?: "cover" | "contain" };

export default function ParkingPhoto({ src, alt, scene = "mall", variant = 0, className = "", fit = "cover" }: Props) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} onError={() => setFailed(true)} className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${className}`} />;
  }
  return (
    <div role="img" aria-label={alt} className={`relative h-full w-full overflow-hidden ${className}`}>
      {scene === "condo" ? <CondoScene /> : <MallScene pillar={PILLAR[variant % PILLAR.length]} />}
      <Car x={22} color="#5b6170" />
      <Car x={56} color="#dfe1e6" />
    </div>
  );
}

// ลานจอดในห้าง: เพดานไฟ เสาสีประจำชั้น ป้าย P เส้นช่องจอดสีเหลือง
function MallScene({ pillar }: { pillar: string }) {
  return (
    <div className="absolute inset-0 bg-asphalt">
      <div className="absolute inset-x-0 top-0 h-[38%] bg-asphalt-deep" />
      <div className="absolute inset-x-[8%] top-[14%] flex justify-between">
        {[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 w-[16%] rounded-full bg-white/80 shadow-[0_0_24px_6px_rgba(255,255,255,0.18)]" />)}
      </div>
      {[12, 46, 80].map((x) => (
        <span key={x} className="absolute top-[38%] h-[62%] w-[6%]" style={{ left: `${x}%`, background: `linear-gradient(${pillar} 0 22%, #3b3e44 22%)` }} />
      ))}
      <span className="absolute right-[5%] top-[44%] grid aspect-square w-[7%] place-items-center rounded-md bg-[#2f6db5] font-display text-[clamp(10px,2.4vw,22px)] font-bold text-white">P</span>
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-asphalt-2"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 calc(17% - 3px), #f2c230 calc(17% - 3px) 17%)" }} />
    </div>
  );
}

// ลานจอดคอนโด: ท้องฟ้า ตึกคอนโดมีหน้าต่าง ต้นไม้ ลานกลางแจ้งเส้นสีขาว
function CondoScene() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(#9cc9e8, #d9ecf6 62%)" }}>
      {/* ตึกคอนโด 2 อาคาร */}
      {[{ l: 8, w: 34, h: 70, c: "#e9e4da" }, { l: 50, w: 40, h: 82, c: "#dcd6ca" }].map((b) => (
        <span key={b.l} className="absolute bottom-[30%]" style={{ left: `${b.l}%`, width: `${b.w}%`, height: `${b.h}%`, background: b.c,
          backgroundImage: "linear-gradient(90deg, transparent 18%, #5d7e98 18% 30%, transparent 30% 44%, #5d7e98 44% 56%, transparent 56% 70%, #5d7e98 70% 82%, transparent 82%), repeating-linear-gradient(transparent 0 9%, #e9e4da 9% 15%)",
          backgroundBlendMode: "multiply" }}>
          <span className="absolute inset-x-0 top-0 h-[6%] bg-[#8a6f55]" />
        </span>
      ))}
      {/* ต้นไม้ */}
      {[3, 40, 88].map((x, i) => (
        <span key={x} className="absolute bottom-[28%]" style={{ left: `${x}%`, width: "11%", height: "26%" }}>
          <span className="absolute bottom-0 left-[44%] h-[35%] w-[12%] bg-[#6b4a2f]" />
          <span className="absolute inset-x-0 bottom-[25%] top-0 rounded-full" style={{ background: i % 2 ? "#3f8a4e" : "#2f7a43" }} />
        </span>
      ))}
      {/* ลานจอดกลางแจ้ง */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[#5a5e66]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 calc(17% - 3px), #f4f4f2 calc(17% - 3px) 17%)" }} />
    </div>
  );
}

// รถมองจากด้านหลัง
function Car({ x, color }: { x: number; color: string }) {
  const roof = color === "#dfe1e6" ? "#c9ccd2" : "#4d5361";
  return (
    <span className="absolute bottom-[8%] h-[22%] w-[18%]" style={{ left: `${x}%` }}>
      <span className="absolute inset-x-[14%] top-0 h-[42%] rounded-t-[45%]" style={{ background: roof }}>
        <span className="absolute inset-x-[12%] bottom-0 top-[22%] rounded-t-[40%] bg-[#1d2027]/70" />
      </span>
      <span className="absolute inset-x-0 bottom-[14%] top-[38%] rounded-md" style={{ background: color }}>
        <span className="absolute left-[6%] top-[28%] h-[22%] w-[18%] rounded-sm bg-[#d8453a]" />
        <span className="absolute right-[6%] top-[28%] h-[22%] w-[18%] rounded-sm bg-[#d8453a]" />
        <span className="absolute inset-x-[36%] bottom-[18%] h-[22%] rounded-[2px] bg-white/90" />
      </span>
      <span className="absolute bottom-0 left-[8%] h-[20%] w-[18%] rounded-b-md bg-[#141518]" />
      <span className="absolute bottom-0 right-[8%] h-[20%] w-[18%] rounded-b-md bg-[#141518]" />
    </span>
  );
}
