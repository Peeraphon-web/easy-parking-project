"use client";
// หน้า /admin/roles: กำหนดสถานที่และเมนูของผู้ดูแลแต่ละคน (Super Admin)
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useLots } from "@/context/LotContext";
import { ADMIN_MENU } from "@/lib/routes";
import type { Admin, MenuKey } from "@/types";

export default function RolesPage() {
  const { admins, saveAdmins } = useAuth();
  const { lots } = useLots();
  const menus = ADMIN_MENU.filter((m) => !m.superOnly);

  function toggle(a: Admin, field: "menus" | "lotIds", value: string) {
    const list = a[field] as string[];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    saveAdmins(admins.map((x) => (x.username === a.username ? { ...x, [field]: next } : x)));
  }

  return (
    <>
      <PageHeader title="สิทธิ์ผู้ใช้" subtitle="Super Admin เข้าได้ทุกเมนูและทุกสถานที่เสมอ" />
      <div className="overflow-x-auto rounded-lg bg-white shadow-card p-5">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2">ผู้ใช้</th>
              {lots.map((l) => <th key={l.id} className="px-2 text-center">{l.name}</th>)}
              {menus.map((m) => <th key={m.key} className="px-2 text-center">{m.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.username} className="border-t border-line">
                <td className="py-3"><b>{a.username}</b><br /><span className="text-xs text-muted">{a.name}</span></td>
                {lots.map((l) => (
                  <td key={l.id} className="text-center">
                    <input id={`lot-${a.username}-${l.id}`} type="checkbox" aria-label={`${a.username} ${l.name}`} disabled={a.role === "super"}
                      checked={a.role === "super" || a.lotIds.includes(l.id)} onChange={() => toggle(a, "lotIds", l.id)} />
                  </td>
                ))}
                {menus.map((m) => (
                  <td key={m.key} className="text-center">
                    <input id={`menu-${a.username}-${m.key}`} type="checkbox" aria-label={`${a.username} ${m.label}`} disabled={a.role === "super"}
                      checked={a.role === "super" || a.menus.includes(m.key as MenuKey)} onChange={() => toggle(a, "menus", m.key)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted">การเปลี่ยนแปลงบันทึกในเบราว์เซอร์นี้ (localStorage) ทันที</p>
    </>
  );
}
