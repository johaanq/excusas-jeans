"use client"

import type { DayPoint } from "@/lib/dashboard-stats"

type Props = {
  title: string
  data: DayPoint[]
  valuePrefix?: string
  formatValue?: (n: number) => string
  height?: number
}

export function LineChartKpi({
  title,
  data,
  valuePrefix = "",
  formatValue = (n) => String(n),
  height = 160,
}: Props) {
  const width = 320
  const pad = { top: 12, right: 8, bottom: 28, left: 40 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const points = data.map((d, i) => {
    const x = pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = pad.top + innerH - (d.value / maxVal) * innerH
    return { x, y, ...d }
  })

  const linePath =
    points.length > 0
      ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : ""

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`
      : ""

  const yTicks = [0, maxVal * 0.5, maxVal]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="mb-3 text-xs font-medium text-slate-500">{title}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-h-[180px] text-slate-400"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={title}
      >
        {yTicks.map((tick, i) => {
          const y = pad.top + innerH - (tick / maxVal) * innerH
          return (
            <g key={i}>
              <line
                x1={pad.left}
                y1={y}
                x2={pad.left + innerW}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.12}
              />
              <text
                x={pad.left - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[9px]"
              >
                {valuePrefix}
                {formatValue(tick)}
              </text>
            </g>
          )
        })}

        {areaPath && (
          <path d={areaPath} fill="currentColor" className="text-slate-900/5" />
        )}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            className="text-slate-800"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((p) => (
          <g key={p.key}>
            <circle cx={p.x} cy={p.y} r={3} className="fill-slate-800" />
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[9px] capitalize"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
