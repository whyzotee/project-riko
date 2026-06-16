import React from "react";
import { type Meal } from "../../store/useMealPlanStore";
import { RefreshCw, Plus, Check } from "lucide-react";

interface MealRowItemProps {
  meal: Meal;
  isLogged: boolean;
  isMealLoading: boolean;
  onRefresh: () => void;
  onLog: () => void;
}

export const MealRowItem: React.FC<MealRowItemProps> = ({
  meal,
  isLogged,
  isMealLoading,
  onRefresh,
  onLog,
}) => {
  const mealIcons: Record<Meal["type"], string> = {
    breakfast: "🍳",
    lunch: "🍛",
    dinner: "🍲",
    snack: "🥛",
  };

  const mealTypeThai: Record<Meal["type"], string> = {
    breakfast: "มื้อเช้า",
    lunch: "มื้อกลางวัน",
    dinner: "มื้อเย็น",
    snack: "ของว่าง",
  };

  const getLocationBadgeStyle = (location: string) => {
    const loc = location.toLowerCase();
    if (loc.includes("7-eleven") || loc.includes("เซเว่น")) {
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    }
    if (loc.includes("แกง")) {
      return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
    }
    if (loc.includes("เตี๋ยว")) {
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }
    if (loc.includes("ตามสั่ง")) {
      return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    }
    return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
  };

  return (
    <div className="group bg-card border border-border p-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">{mealIcons[meal.type]}</span>
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
            {mealTypeThai[meal.type]}
          </span>
          <span
            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${getLocationBadgeStyle(
              meal.location
            )}`}
          >
            {meal.location}
          </span>
        </div>
        <h5 className="font-bold text-xs sm:text-sm text-foreground truncate">
          {meal.name}
        </h5>
        <div className="flex items-center gap-x-2.5 gap-y-1 text-[9px] text-muted-foreground flex-wrap font-bold">
          <span>🔥 {meal.calories} kcal</span>
          <span>•</span>
          <span>โปรตีน {meal.protein}g</span>
          <span>•</span>
          <span>คาร์บ {meal.carbs}g</span>
          <span>•</span>
          <span>ไขมัน {meal.fat}g</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isMealLoading}
          className="w-7 h-7 bg-muted hover:bg-muted/80 disabled:opacity-50 text-muted-foreground rounded-lg flex items-center justify-center transition-colors"
          title="เปลี่ยนเมนูนี้"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isMealLoading ? "animate-spin text-primary" : ""}`} />
        </button>

        <button
          onClick={onLog}
          disabled={isLogged}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isLogged
              ? "bg-success/15 text-success border border-success/20"
              : "bg-primary hover:bg-primary/95 text-primary-foreground hover:scale-105 active:scale-95"
          }`}
          title={isLogged ? "บันทึกเรียบร้อย" : "บันทึกลงไดอารี่การกิน"}
        >
          {isLogged ? <Check className="w-3.5 h-3.5 font-bold" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
