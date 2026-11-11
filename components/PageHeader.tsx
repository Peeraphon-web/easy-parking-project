// Heading for every page: <PageHeader title="..." subtitle="...">buttons on the right</PageHeader>
type Props = { title: string; subtitle?: string; children?: React.ReactNode };

export default function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-1">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-ink sm:text-[2.5rem] sm:leading-[1.15]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[65ch] text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
