// Driver-side layout: every page in app/(user)/ gets the sidebar menu on the left
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Suspense fallback={<div className="h-14 bg-asphalt md:h-screen md:w-64 md:shrink-0" />}>
        <Navbar />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 pb-16 pt-6 md:px-8 xl:px-10">
        <div className="mx-auto max-w-[96rem]">
          <Suspense fallback={<p className="text-muted">กำลังโหลด…</p>}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
