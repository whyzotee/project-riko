import React from "react";
import { Dumbbell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutCheckinProps {
  selectedDateStr: string;
  todayStr: string;
  activeWorkoutDay: { gym: boolean; walk: boolean; steps10k?: boolean };
  toggleGym: (dateStr: string) => void;
  toggleWalk: (dateStr: string) => void;
  toggleSteps10k: (dateStr: string) => void;
  formatDateThai: (dateStr: string) => string;
}

export const WorkoutCheckin: React.FC<WorkoutCheckinProps> = ({
  selectedDateStr,
  todayStr,
  activeWorkoutDay,
  toggleGym,
  toggleWalk,
  toggleSteps10k,
  formatDateThai,
}) => {
  const isTodaySelected = selectedDateStr === todayStr;

  return (
    <section className="bg-card p-6 rounded-2xl border border-border space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-success/15 rounded-xl flex items-center justify-center text-success">
          <Dumbbell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-foreground text-lg tracking-tight">
            เช็คอินออกกำลังกาย
          </h4>
          <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
            {formatDateThai(selectedDateStr)} {isTodaySelected && "(วันนี้)"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Gym Check-in Button */}
        <motion.button
          whileHover={isTodaySelected ? { scale: 1.02 } : {}}
          whileTap={isTodaySelected ? { scale: 0.98 } : {}}
          disabled={!isTodaySelected}
          onClick={() => toggleGym(selectedDateStr)}
          className={cn(
            "p-3.5 rounded-xl border text-left flex flex-col justify-between h-[6.5rem] transition-all duration-300 w-full col-span-1",
            activeWorkoutDay.gym
              ? "bg-success text-white border-transparent shadow-[0_8px_16px_rgba(34,197,94,0.15)]"
              : "bg-muted text-foreground border-border",
            isTodaySelected && "hover:bg-muted/80",
            !isTodaySelected && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="flex items-start justify-between w-full">
            <span className="text-2xl">🏋️</span>
            {activeWorkoutDay.gym ? (
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-success shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            ) : (
              isTodaySelected && (
                <span className="text-[9px] font-black text-success uppercase tracking-widest bg-success/15 px-1.5 py-0.5 rounded">
                  +100 pts
                </span>
              )
            )}
          </div>
          <div>
            <p className={cn("font-black text-xs sm:text-sm leading-none italic", activeWorkoutDay.gym ? "text-white" : "text-foreground")}>
              เข้ายิม (Gym)
            </p>
            <p className={cn("text-[8px] font-black tracking-widest uppercase mt-1", activeWorkoutDay.gym ? "text-white/80" : "text-muted-foreground")}>
              {selectedDateStr > todayStr 
                ? "Future Date" 
                : selectedDateStr < todayStr 
                  ? (activeWorkoutDay.gym ? "Completed!" : "No Record") 
                  : (activeWorkoutDay.gym ? "Completed!" : "Check-in")}
            </p>
          </div>
        </motion.button>

        {/* Incline Walk Check-in Button */}
        <motion.button
          whileHover={isTodaySelected ? { scale: 1.02 } : {}}
          whileTap={isTodaySelected ? { scale: 0.98 } : {}}
          disabled={!isTodaySelected}
          onClick={() => toggleWalk(selectedDateStr)}
          className={cn(
            "p-3.5 rounded-xl border text-left flex flex-col justify-between h-[6.5rem] transition-all duration-300 w-full col-span-1",
            activeWorkoutDay.walk
              ? "bg-success text-white border-transparent shadow-[0_8px_16px_rgba(34,197,94,0.15)]"
              : "bg-muted text-foreground border-border",
            isTodaySelected && "hover:bg-muted/80",
            !isTodaySelected && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="flex items-start justify-between w-full">
            <span className="text-2xl">⛰️</span>
            {activeWorkoutDay.walk ? (
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-success shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            ) : (
              isTodaySelected && (
                <span className="text-[9px] font-black text-success uppercase tracking-widest bg-success/15 px-1.5 py-0.5 rounded">
                  +50 pts
                </span>
              )
            )}
          </div>
          <div>
            <p className={cn("font-black text-xs sm:text-sm leading-none italic", activeWorkoutDay.walk ? "text-white" : "text-foreground")}>
              เดินชัน (Walk)
            </p>
            <p className={cn("text-[8px] font-black tracking-widest uppercase mt-1", activeWorkoutDay.walk ? "text-white/80" : "text-muted-foreground")}>
              {selectedDateStr > todayStr 
                ? "Future Date" 
                : selectedDateStr < todayStr 
                  ? (activeWorkoutDay.walk ? "Completed!" : "No Record") 
                  : (activeWorkoutDay.walk ? "Completed!" : "Check-in")}
            </p>
          </div>
        </motion.button>

        {/* Steps 10k Check-in Button */}
        <motion.button
          whileHover={isTodaySelected ? { scale: 1.02 } : {}}
          whileTap={isTodaySelected ? { scale: 0.98 } : {}}
          disabled={!isTodaySelected}
          onClick={() => toggleSteps10k(selectedDateStr)}
          className={cn(
            "p-3.5 rounded-xl border text-left flex flex-col justify-between h-[6.5rem] transition-all duration-300 w-full col-span-2 sm:col-span-1",
            activeWorkoutDay.steps10k
              ? "bg-success text-white border-transparent shadow-[0_8px_16px_rgba(34,197,94,0.15)]"
              : "bg-muted text-foreground border-border",
            isTodaySelected && "hover:bg-muted/80",
            !isTodaySelected && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="flex items-start justify-between w-full">
            <span className="text-2xl">👟</span>
            {activeWorkoutDay.steps10k ? (
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-success shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            ) : (
              isTodaySelected && (
                <span className="text-[9px] font-black text-success uppercase tracking-widest bg-success/15 px-1.5 py-0.5 rounded">
                  +50 pts
                </span>
              )
            )}
          </div>
          <div>
            <p className={cn("font-black text-xs sm:text-sm leading-none italic", activeWorkoutDay.steps10k ? "text-white" : "text-foreground")}>
              เดิน 10,000 ก้าว
            </p>
            <p className={cn("text-[8px] font-black tracking-widest uppercase mt-1", activeWorkoutDay.steps10k ? "text-white/80" : "text-muted-foreground")}>
              {selectedDateStr > todayStr 
                ? "Future Date" 
                : selectedDateStr < todayStr 
                  ? (activeWorkoutDay.steps10k ? "Completed!" : "No Record") 
                  : (activeWorkoutDay.steps10k ? "Completed!" : "Check-in")}
            </p>
          </div>
        </motion.button>
      </div>
    </section>
  );
};
