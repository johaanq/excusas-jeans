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
}

export function DonutKpi({
  title,
  value,
  subtitle,
  segments,
  size = 128,
  strokeWidth = 14,
}: DonutKpiProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const safeTotal = total > 0 ? total : 1

  let offset = 0

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <div className="relative" style={{ width: size, height: size }}>
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

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span className="text-2xl font-bold tabular-nums text-slate-900 leading-none">
            {value}
          </span>
          {subtitle && (
            <span className="mt-1 text-[10px] font-medium text-slate-500 leading-tight">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {segments.length > 0 && (
        <ul className="mt-4 flex w-full flex-wrap justify-center gap-x-3 gap-y-1">
          {segments.map((segment, index) => (
            <li
              key={`legend-${index}`}
              className="flex items-center gap-1.5 text-[11px] text-slate-600"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span>
                {segment.label ?? "—"} ({segment.value})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
