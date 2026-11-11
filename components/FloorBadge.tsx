// Floor badge: a square in the floor's level colour, like the painted pillars in a car park
// <FloorBadge floor="B1" index={0} size="md" />. index = the floor's position in lot.floors (sets the colour)
const LEVELS = ["bg-lvl-a", "bg-lvl-b", "bg-lvl-c", "bg-lvl-d"];

const SIZES = {
  xs: "h-6 min-w-6 px-1 text-xs rounded-[4px]",
  sm: "h-8 min-w-8 px-1.5 text-sm rounded-[5px]",
  md: "h-11 min-w-11 px-2 text-lg rounded-md",
  lg: "h-16 min-w-16 px-3 text-3xl rounded-md",
  xl: "h-28 min-w-28 px-4 text-7xl rounded-lg",
};

export const levelClass = (index: number) => LEVELS[((index % LEVELS.length) + LEVELS.length) % LEVELS.length];

export default function FloorBadge({ floor, index, size = "md" }: { floor: string; index: number; size?: keyof typeof SIZES }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center font-display font-bold leading-none text-white ${levelClass(index)} ${SIZES[size]}`}
      aria-label={`ชั้น ${floor}`}>
      {floor}
    </span>
  );
}
