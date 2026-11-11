"use client";
// เช็กว่ามีสถานที่นี้จริง ถ้าไม่มีแสดงหน้าไม่พบ
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLots } from "@/context/LotContext";
import { getLot } from "@/lib/lots";

export default function LotLayout({ children }: { children: React.ReactNode }) {
  const { lot: lotId } = useParams<{ lot: string }>();
  const { lots } = useLots();

  if (!getLot(lotId, lots)) {
    return (
      <div className="grid justify-items-center gap-3 py-16 text-center">
        <h1 className="text-2xl text-ink">ไม่พบสถานที่ “{decodeURIComponent(lotId)}”</h1>
        <p className="text-muted">ลิงก์อาจผิด หรือสถานที่นี้ถูกลบออกจากระบบแล้ว</p>
        <Link href="/" className="rounded-md bg-paint hover:bg-paint-hi px-5 py-2.5 font-display font-semibold text-ink">เลือกสถานที่</Link>
      </div>
    );
  }
  return <>{children}</>;
}
