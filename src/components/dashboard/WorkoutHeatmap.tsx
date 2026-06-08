import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutHeatmapProps {
  gridDays: Date[];
  selectedDateStr: string;
  setSelectedDateStr: (dateStr: string) => void;
  history: Record<string, { gym: boolean; walk: boolean; steps10k?: boolean }>;
  todayStr: string;
  formatLocalDate: (date: Date) => string;
  formatDateThai: (dateStr: string) => string;
}

export const WorkoutHeatmap: React.FC<WorkoutHeatmapProps> = ({
  gridDays,
  selectedDateStr,
  setSelectedDateStr,
  history,
  todayStr,
  formatLocalDate,
  formatDateThai,
}) => {
  const getDayColor = (dateStr: string) => {
    const day = history[dateStr];
    if (!day) return "bg-muted text-muted-foreground/60 hover:ring-1 hover:ring-muted-foreground/30";
    const count = (day.gym ? 1 : 0) + (day.walk ? 1 : 0) + (day.steps10k ? 1 : 0);
    if (count >= 2) {
      return "bg-success text-white shadow-[0_0_8px_rgba(34,197,94,0.3)] hover:scale-110";
    }
    if (count === 1) {
      return "bg-success/50 text-white hover:scale-110";
    }
    return "bg-muted text-muted-foreground/60 hover:ring-1 hover:ring-muted-foreground/30";
  };

  return (
    <section className="bg-card p-5 rounded-2xl border border-border space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      <div className="px-1">
        <h4 className="font-black text-foreground text-lg tracking-tight">
          Workout Heatmap
        </h4>
      </div>

      <div className="pt-2">
        <div className="grid grid-cols-7 gap-2 w-full select-none cursor-pointer">
          <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">อา.</span>
          <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">จ.</span>
          <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">อ.</span>
          <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">พ.</span>
          <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">พฤ.</span>
          <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">ศ.</span>
          <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">ส.</span>

          {gridDays.map((day) => {
            const dateStr = formatLocalDate(day);
            const isSelected = dateStr === selectedDateStr;
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;

            return (
              <motion.button
                key={dateStr}
                disabled={isFuture}
                whileHover={!isFuture ? { scale: 1.1, zIndex: 10 } : {}}
                whileTap={!isFuture ? { scale: 0.9 } : {}}
                onClick={() => setSelectedDateStr(dateStr)}
                className={cn(
                  "w-full aspect-square rounded-lg transition-all duration-200 relative text-xs sm:text-sm font-black flex items-center justify-center",
                  getDayColor(dateStr),
                  isToday && !isSelected && "border border-primary/50",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10",
                  isFuture && "opacity-20 cursor-not-allowed text-muted-foreground/20"
                )}
                title={`${formatDateThai(dateStr)}: ${
                  history[dateStr]?.gym ? "Gym " : ""
                }${history[dateStr]?.walk ? "Walk" : "No Workout"}`}
              >
                {day.getDate()}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] text-muted-foreground px-1 border-t border-border pt-3">
        <span>{formatDateThai(selectedDateStr)}</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-4 h-4 rounded bg-muted" />
          <div className="w-4 h-4 rounded bg-success/50" />
          <div className="w-4 h-4 rounded bg-success" />
          <span>More</span>
        </div>
      </div>
    </section>
  );
};
