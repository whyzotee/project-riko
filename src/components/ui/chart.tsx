import * as React from "react"
import { ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: React.ReactNode
    color?: string
  }
>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: {
  config: ChartConfig
  children: React.ReactElement
  className?: string
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

export const ChartTooltip = Tooltip

interface ChartTooltipPayloadItem {
  color?: string
  fill?: string
  value: number | string
}

export interface ChartTooltipContentProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string
  hideLabel?: boolean
}

export function ChartTooltipContent({ active, payload, label, hideLabel }: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {!hideLabel && <div className="mb-2 font-black uppercase tracking-widest text-[10px] text-zinc-400">{label}</div>}
      <div className="space-y-1.5">
        {payload.map((item: ChartTooltipPayloadItem, index: number) => (
          <div key={index} className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="font-black text-zinc-900 text-sm tracking-tighter">
               {item.value.toLocaleString()} <span className="text-[10px] text-zinc-400 uppercase ml-1">kcal</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
