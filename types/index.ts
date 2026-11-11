// ===== Type ของข้อมูลทั้งระบบ =====

export type Rates = {
  freeMinutes: number; // จอดฟรีกี่นาทีแรก
  perHour: number;     // บาทต่อชั่วโมง (เศษชั่วโมงปัดขึ้น)
  dayMax: number;      // เหมาจ่ายสูงสุดต่อวัน
  bookingFee: number;  // ค่าบริการจองล่วงหน้า (เก็บรวมตอนออก)
};

export type Lot = {
  id: string;          // ใช้ใน URL เช่น /central-world
  name: string;
  address: string;
  openHours: string;
  phone: string;
  rates: Rates;
  floors: string[];    // ชื่อชั้น เรียงตามลำดับ
  exits: string[];     // ประตูทางออก ใช้กับตู้ Kiosk
  scene?: "mall" | "condo"; // ใช้เลือกภาพประกอบ: ลานในห้าง หรือ ลานคอนโดกลางแจ้ง
  image?: string;           // รูปที่ผู้ดูแลอัปโหลด (data URL ย่อแล้ว) ถ้าไม่มีจะใช้ภาพวาดตาม scene
};

export type CellType = "slot" | "road" | "wall" | "entry" | "exit" | "lift" | "empty";
export type SlotKind = "normal" | "ev" | "disabled" | "moto";

export type Cell = {
  x: number;
  y: number;
  type: CellType;
  code?: string;       // เฉพาะช่องจอด เช่น B1-A01
  kind?: SlotKind;
};

export type Layout = {
  lotId: string;
  floor: string;
  cols: number;
  rows: number;
  cells: Cell[];       // เก็บเฉพาะช่องที่ไม่ใช่ "empty"
};

export type SlotStatus = "free" | "busy" | "reserved";
export type CarType = "Sedan" | "SUV" | "Pickup" | "Hatchback" | "Van";

// ข้อมูลรถใน cars.json (ใช้ minutesAgo เพื่อให้เวลาเข้าเป็น "วันนี้" ทุกครั้งที่เปิด)
// ที่มาของตำแหน่งรถ (ระบบจริงต้องมีอุปกรณ์บอก เพราะกล้องทางเข้าไม่รู้ว่ารถไปจอดช่องไหน)
// slot-camera = กล้องอ่านป้ายเหนือช่องจอด · booking = ช่องที่จองไว้ · qr = ผู้ขับสแกน QR ที่เสาบันทึกเอง
export type LocatedBy = "slot-camera" | "booking" | "qr";

export type CarRecord = {
  plate: string;
  province: string;
  type: CarType;
  color: string;
  lotId: string;
  slot: string;
  minutesAgo: number;
  locatedBy?: LocatedBy; // ระบบรู้ตำแหน่งรถจากอะไร (ไม่ใส่ = กล้องที่ช่องจอด)
};

// รถที่แปลงเวลาแล้ว พร้อมใช้ในหน้าเว็บ
export type Car = Omit<CarRecord, "minutesAgo"> & { timeIn: string };

// confirmed = จองแล้ว รอรถมา · checked_in = รถเข้าจอดแล้ว · completed = จ่ายเงินออกแล้ว
// cancelled = ผู้ใช้ยกเลิก · no_show = เลยเวลา 15 นาทีแล้วรถไม่มา (ระบบคิดให้อัตโนมัติ)
export type BookingStatus = "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show";

export type Booking = {
  id: string;
  lotId: string;
  plate: string;
  slot: string;
  date: string;        // YYYY-MM-DD (เวลาไทย)
  time: string;        // HH:MM เวลาที่จะมาถึง (ไม่ต้องระบุเวลาออก)
  status: BookingStatus;
  createdAt?: string;  // ISO
  originalSlot?: string; // ช่องเดิม ถ้าระบบย้ายช่องให้ตอนรถเข้า
  changes?: number;      // เปลี่ยนเวลามาถึงไปแล้วกี่ครั้ง (สูงสุด 2)
};

export type PayMethod = "ThaiQR" | "Cash";

export type Payment = {
  ref: string;
  lotId: string;
  plate: string;
  carType: CarType;
  slot: string;
  timeIn: string;      // ISO
  timeOut: string;     // ISO
  amount: number;       // ยอดรวมที่จ่าย
  bookingFee?: number;  // ส่วนที่เป็นค่าบริการจอง (ถ้ามี)
  method: PayMethod;
};

export type AdminRole = "super" | "lot";
export type MenuKey = "dashboard" | "door" | "slots" | "finance" | "activity" | "roles" | "lots" | "layout-editor";

export type Admin = {
  username: string;
  password: string;    // Mock เท่านั้น ระบบจริงห้ามเก็บรหัสผ่านแบบนี้
  name: string;
  role: AdminRole;
  lotIds: string[];    // super = ทุกลาน
  menus: MenuKey[];
};
