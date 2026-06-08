import React from "react";
import { Link } from "@tanstack/react-router";
import { Utensils, Plus, ChevronRight } from "lucide-react";

interface DietDiaryCardProps {
  consumedCalories: number;
  remainingCalories: number;
  tdee: number;
}

export const DietDiaryCard: React.FC<DietDiaryCardProps> = ({
  consumedCalories,
  remainingCalories,
  tdee,
}) => {
  return (
    <section className="bg-gradient-to-br from-primary/10 to-secondary/15 p-6 rounded-2xl border border-primary/20 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center text-secondary">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-foreground text-base">
              Diet Diary (ฟีเจอร์เสริม)
            </h4>
            <p className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
              Calorie & Macro Tracker
            </p>
          </div>
        </div>
        <Link
          to="/scan"
          className="w-8 h-8 bg-primary hover:bg-primary/95 text-primary-foreground rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Calorie Stats Preview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card/50 p-4 rounded-xl border border-border">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
            CONSUMED
          </span>
          <p className="text-xl font-black italic text-foreground tabular-nums leading-none">
            {Math.round(consumedCalories)}
          </p>
          <p className="text-[8px] font-bold text-muted-foreground mt-1 uppercase">KCAL</p>
        </div>
        <div className="bg-card/50 p-4 rounded-xl border border-border">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
            REMAINING
          </span>
          <p className="text-xl font-black italic text-secondary tabular-nums leading-none">
            {Math.round(remainingCalories)}
          </p>
          <p className="text-[8px] font-bold text-muted-foreground mt-1 uppercase">KCAL LEFT</p>
        </div>
      </div>

      {/* Link to Logs and Scan */}
      <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase border-t border-border pt-3">
        <Link to="/logs" className="text-secondary hover:text-primary hover:underline flex items-center gap-1">
          ดูบันทึกทั้งหมด <ChevronRight className="w-3 h-3" />
        </Link>
        <span className="text-muted-foreground">Target: {tdee} kcal</span>
      </div>
    </section>
  );
};
