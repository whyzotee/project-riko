import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WeeklyGymRoutineProps {
  history: Record<string, { gym: boolean; walk: boolean; steps10k?: boolean }>;
  todayStr: string;
}

export const WeeklyGymRoutine: React.FC<WeeklyGymRoutineProps> = () => {
  const scheduleItems = [
    { day: "จันทร์", label: "จ.", routine: "อก + หลังแขน 🏋️", index: 1 },
    { day: "อังคาร", label: "อ.", routine: "หลัง + หน้าแขน 💪", index: 2 },
    { day: "พุธ", label: "พ.", routine: "พัก หรือ เดิน 10,000 ก้าว 👟", index: 3 },
    { day: "พฤหัสบดี", label: "พฤ.", routine: "ไหล่ + ขา 🦵", index: 4 },
    { day: "ศุกร์", label: "ศ.", routine: "อก + หลัง 🔥", index: 5 },
    { day: "เสาร์", label: "ส.", routine: "เก็บตก หรือ เดิน 10,000 ก้าว 🚶", index: 6 },
    { day: "อาทิตย์", label: "อา.", routine: "พักผ่อนเต็มที่ 😴", index: 0 },
  ];

  const currentDayOfWeek = new Date().getDay();

  return (
    <section className="bg-card p-6 rounded-2xl border border-border space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-foreground text-lg tracking-tight">
            ตารางออกกำลังกายประจำสัปดาห์
          </h4>
          <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
            Weekly Gym Routine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {scheduleItems.map((item) => {
          const isToday = currentDayOfWeek === item.index;
          return (
            <motion.div
              key={item.day}
              whileHover={{ scale: 1.01, x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                isToday
                  ? "bg-primary/15 border-primary/40 shadow-[0_0_12px_rgba(152,16,250,0.15)]"
                  : "bg-background/40 border-border/60 hover:bg-background/60"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0",
                    isToday
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "font-bold text-sm",
                    isToday ? "text-foreground font-black" : "text-muted-foreground"
                  )}
                >
                  {item.day}
                </span>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold text-right",
                  isToday ? "text-secondary font-black" : "text-foreground/90"
                )}
              >
                {item.routine}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
