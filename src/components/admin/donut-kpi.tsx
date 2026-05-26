"use client"

interface DonutSegment {
  value: number
  color: string
  label?: string
}

interface DonutKpiProps {
  title: string
  value: string | number
  subtitle?: string
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  layout?: "centered" | "compact"
}

export function DonutKpi({
  title,
  value,
  subtitle,
  segments,
  size = 128,
  strokeWidth = 14,
  layout = "centered",
}: DonutKpiProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const safeTotal = total > 0 ? total : 1

  let offset = 0

  const chart = (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        {segments.map((segment, index) => {
          const length = (segment.value / safeTotal) * circumference
          const dashoffset = -offset
          offset += length
          return (
            <circle
              key={`${segment.color}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <span className="text-xl font-bold tabular-nums leading-none text-slate-900 md:text-2xl">
          {value}
        </span>
        {subtitle && (
          <span className="mt-1 text-[10px] font-medium leading-tight text-slate-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )

  const legend = segments.length > 0 && (
    <ul
      className={
        layout === "compact"
          ? "mt-3 flex w-full flex-col gap-1"
          : "mt-4 flex w-full flex-wrap justify-center gap-x-3 gap-y-1"
      }
    >
      {segments.map((segment, index) => (
        <li
          key={`legend-${index}`}
          className="flex items-center gap-2 text-[11px] text-slate-600"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: segment.color }}
          />
          <span className="truncate">
            {segment.label ?? "—"} ({segment.value})
          </span>
        </li>
      ))}
    </ul>
  )

  if (layout === "compact") {
    return (
      <div className="flex w-full max-w-xs flex-col items-center">
        <p className="mb-3 w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {chart}
        {legend}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      {chart}
      {legend}
    </div>
  )
}
