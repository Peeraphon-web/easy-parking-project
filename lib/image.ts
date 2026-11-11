// ===== ย่อรูปที่ผู้ใช้อัปโหลดก่อนเก็บ (ไม่มี Back End เลยเก็บเป็น data URL ใน localStorage) =====
// ย่อด้านยาวไม่เกิน 1200px และบีบเป็น JPEG ให้เหลือประมาณ 100–300 KB ต่อรูป

export const MAX_UPLOAD_MB = 10;

export async function resizeImage(file: File, maxSide = 1200, quality = 0.82): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("ไฟล์นี้ไม่ใช่รูปภาพ เลือกไฟล์ .jpg, .png หรือ .webp");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`รูปใหญ่เกิน ${MAX_UPLOAD_MB} MB เลือกรูปที่เล็กกว่านี้`);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // รูป PNG พื้นโปร่งใสจะได้พื้นขาว ไม่ใช่สีดำ
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

// เช็กว่าเบราว์เซอร์ยังมีที่ว่างพอเก็บรูปนี้ไหม (localStorage มีประมาณ 5 MB)
export function fitsInStorage(dataUrl: string): boolean {
  try {
    window.localStorage.setItem("ep:__size-test", dataUrl);
    window.localStorage.removeItem("ep:__size-test");
    return true;
  } catch {
    return false;
  }
}

export const sizeKB = (dataUrl: string) => Math.round((dataUrl.length * 3) / 4 / 1024);
