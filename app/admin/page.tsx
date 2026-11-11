import { redirect } from "next/navigation";

// เข้า /admin เฉยๆ → ไปหน้า login
export default function AdminIndex() {
  redirect("/admin/login");
}
