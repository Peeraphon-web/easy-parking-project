"use client";
// ===== localStorage แบบกัน error + hook ที่ใช้แทน useState แล้วจำค่าไว้ =====
import { useCallback, useEffect, useState } from "react";

const PREFIX = "ep:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* เบราว์เซอร์ไม่ให้เก็บ (เช่นโหมดไม่ระบุตัวตน) ก็ใช้ต่อได้ แค่ไม่จำ */
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {}
}

// ใช้เหมือน useState แต่ค่าจะถูกเก็บลง localStorage
// ตอน render ครั้งแรกจะได้ fallback ก่อน (กัน hydration error) แล้วค่อยโหลดค่าที่เก็บไว้
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(load(key, fallback));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        save(key, v);
        return v;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    remove(key);
    setValue(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, update, ready, reset] as const;
}

// เวลาปัจจุบันที่อัปเดตทุก N วินาที (เริ่มเป็น null แล้วค่อยใส่ค่าหลังโหลด
// เพราะ Next.js 16 ไม่ให้เรียก new Date() ตอน prerender)
export function useNow(intervalMs = 30000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
