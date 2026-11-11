"use client";
// หน้า /admin/login (ไม่มี Sidebar)
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(username, password)) router.push("/admin/dashboard");
    else setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  return (
    <main className="grid min-h-screen place-items-center border-t-4 border-paint bg-asphalt px-4">
      <div className="grid w-full max-w-sm gap-6">
      <Wordmark className="text-2xl text-white" />
      <form onSubmit={submit} className="grid gap-4 rounded-lg bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Area Login</h1>
        </div>
        <label className="grid gap-1 text-sm">ชื่อผู้ใช้
          <input id="login-user" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-md border border-ink/35 px-3 py-2.5 text-base" autoComplete="username" />
        </label>
        <label className="grid gap-1 text-sm">รหัสผ่าน
          <input id="login-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-md border border-ink/35 px-3 py-2.5 text-base" autoComplete="current-password" />
        </label>
        {error && <p className="rounded-lg bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>}
        <button className="rounded-md bg-paint hover:bg-paint-hi py-3 font-display font-semibold text-ink">เข้าสู่ระบบ</button>
        {/* <div className="rounded-md bg-surface p-3 text-xs text-muted">
          บัญชีทดลอง (รหัสผ่าน 1234 ทุกบัญชี)<br />
          <b>admin</b> = Super Admin ทุกสถานที่ · <b>mall</b> = อีซี่ มอลล์ · <b>condo</b> = กรีน คอนโด
        </div> */}
      </form>
      </div>
    </main>
  );
}
