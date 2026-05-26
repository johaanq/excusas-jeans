"use client"

import { Card } from "@/components/ui/card"
import { DonutKpi } from "@/components/admin/donut-kpi"
import { LineChartKpi } from "@/components/admin/line-chart-kpi"
import type { DayPoint } from "@/lib/dashboard-stats"

type DonutSegment = { value: number; color: string; label?: string }

type Props = {
  heading: string
  description?: string
  donutTitle: string
  donutValue: string | number
  donutSubtitle?: string
  segments: DonutSegment[]
  lineTitle: string
  lineData: DayPoint[]
  linePrefix?: string
  formatLineValue?: (n: number) => string
}

export function KpiPanel({
  heading,
  description,
  donutTitle,
  donutValue,
  donutSubtitle,
  segments,
  lineTitle,
  lineData,
  linePrefix,
  formatLineValue,
}: Props) {
  return (
    <Card className="border-slate-200/90 bg-white p-0 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:divide-x md:divide-slate-100">
        <div className="flex items-center justify-center p-4 md:p-5">
          <DonutKpi
            title={donutTitle}
            value={donutValue}
            subtitle={donutSubtitle}
            segments={segments}
            layout="compact"
            size={112}
            strokeWidth={12}
          />
        </div>
        <div className="border-t border-slate-100 p-4 md:border-t-0 md:p-5">
          <LineChartKpi
            title={lineTitle}
            data={lineData}
            valuePrefix={linePrefix}
            formatValue={formatLineValue}
          />
        </div>
      </div>
    </Card>
  )
}
