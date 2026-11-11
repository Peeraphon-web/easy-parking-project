import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div className="grid gap-3">
        <p className="font-display text-6xl font-bold text-ink">404</p>
        <h1 className="text-2xl">ไม่พบหน้านี้</h1>
        <p className="text-muted">ลิงก์อาจผิด หรือสถานที่นี้ไม่ได้อยู่ในระบบแล้ว</p>
        <Link href="/" className="mx-auto rounded-md bg-paint hover:bg-paint-hi px-5 py-2.5 font-display font-semibold text-ink">
          กลับไปเลือกสถานที่
        </Link>
      </div>
    </main>
  );
}
