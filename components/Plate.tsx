// Licence plate: <Plate plate="กข 1234" province="กรุงเทพมหานคร" size="lg" />
// Drawn like a real Thai plate: white background, black frame, province on the bottom line
type Props = { plate: string; province?: string; size?: "sm" | "md" | "lg" };

const SIZES = {
  sm: "text-sm px-2 py-0.5 border-[1.5px] rounded-[3px]",
  md: "text-lg px-3 py-0.5 border-2 rounded-[4px]",
  lg: "text-4xl px-5 py-1.5 border-[3px] rounded-md",
};

export default function Plate({ plate, province, size = "md" }: Props) {
  return (
    <span className={`inline-flex flex-col items-center border-ink bg-white font-display font-bold leading-tight tracking-wide text-ink ${SIZES[size]}`}>
      <span className="num whitespace-nowrap">{plate}</span>
      {province && <small className="text-[0.38em] font-medium tracking-normal">{province}</small>}
    </span>
  );
}
