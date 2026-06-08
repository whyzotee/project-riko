import React from "react";
import {
  Flame,
  Trophy,
  Utensils,
  Sparkles,
  Wand2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NutritionData = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
};

interface NutritionDisplayProps {
  data: NutritionData;
  isEditing?: boolean;
  onDataChange?: (newData: Partial<NutritionData>) => void;
  // AI Refinement
  showAIRefine?: boolean;
  refinementText?: string;
  onRefinementTextChange?: (text: string) => void;
  onAIRefine?: () => void;
  isRefining?: boolean;
}

export const NutritionDisplay: React.FC<NutritionDisplayProps> = ({
  data,
  isEditing,
  onDataChange,
  showAIRefine,
  refinementText,
  onRefinementTextChange,
  onAIRefine,
  isRefining
}) => {
  const updateField = (field: keyof NutritionData, value: number) => {
    onDataChange?.({ [field]: value });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      {/* AI Refinement Section - Only in Edit Mode */}
      {isEditing && showAIRefine && (
        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
              <Wand2 className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
              AI Refinement
            </p>
          </div>
          <textarea
            value={refinementText}
            onChange={(e) => onRefinementTextChange?.(e.target.value)}
            placeholder="Add details (e.g., Rice 150g, Chicken 200g, no oil)"
            className="w-full bg-background border border-border rounded-xl p-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary min-h-24 resize-none"
          />
          <button
            onClick={onAIRefine}
            disabled={isRefining || !refinementText?.trim()}
            className="w-full py-4 bg-primary hover:bg-primary/95 disabled:bg-muted rounded-xl text-primary-foreground font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {isRefining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isRefining ? "Calculating..." : "Recalculate with AI"}
          </button>
        </div>
      )}

      {/* Nutrition Hero Card */}
      <div className="bg-card rounded-2xl p-8 text-foreground relative shadow-2xl overflow-hidden border border-border">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16"></div>

        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                Total Calories
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              {isEditing ? (
                <input
                  type="number"
                  value={data.calories}
                  onChange={(e) =>
                    updateField("calories", Number(e.target.value))
                  }
                  className="text-6xl font-black tracking-tighter italic bg-background/50 border border-border rounded-2xl px-3 w-40 outline-none text-foreground"
                />
              ) : (
                <p className="text-6xl font-black tracking-tighter italic tabular-nums leading-none">
                  {Math.round(data.calories)}
                </p>
              )}
              <span className="text-xl font-black text-muted-foreground italic">
                kcal
              </span>
            </div>
          </div>
          {!isEditing && (
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-secondary border border-border">
              <Trophy className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Macro Ratio Bar */}
        <div className="mt-10 space-y-4 relative z-10">
          <div className="h-4 bg-background rounded-full flex overflow-hidden border border-border p-1 gap-1">
            <div
              className="bg-pink-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(236,72,153,0.4)]"
              style={{
                width: `${(data.protein * 400) / (data.protein * 4 + data.carbs * 4 + data.fat * 9 || 1)}%`
              }}
            ></div>
            <div
              className="bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
              style={{
                width: `${(data.carbs * 400) / (data.protein * 4 + data.carbs * 4 + data.fat * 9 || 1)}%`
              }}
            ></div>
            <div
              className="bg-zinc-400 rounded-full transition-all duration-1000"
              style={{
                width: `${(data.fat * 900) / (data.protein * 4 + data.carbs * 4 + data.fat * 9 || 1)}%`
              }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Protein",
                emoji: "🍗",
                field: "protein" as const,
                color: "text-pink-500"
              },
              {
                label: "Carbs",
                emoji: "🍚",
                field: "carbs" as const,
                color: "text-blue-500"
              },
              {
                label: "Fat",
                emoji: "🧈",
                field: "fat" as const,
                color: "text-zinc-450"
              }
            ].map((macro) => (
              <div key={macro.label} className="text-center">
                <div className="flex flex-col items-center justify-center gap-1 mb-1">
                  <span className="text-xl mb-1">{macro.emoji}</span>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                    {macro.label}
                  </p>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={data[macro.field]}
                    onChange={(e) =>
                      updateField(macro.field, Number(e.target.value))
                    }
                    className="text-lg font-black italic bg-background/50 border border-border rounded-lg px-1 w-full text-center outline-none text-foreground"
                  />
                ) : (
                  <p className={cn("text-lg font-black italic", macro.color)}>
                    {Math.round(data[macro.field])}g
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Sodium",
            emoji: "🧂",
            field: "sodium" as const,
            unit: "mg",
            icon: Utensils
          },
          {
            label: "Sugar",
            emoji: "🍭",
            field: "sugar" as const,
            unit: "g",
            icon: Sparkles
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground shadow-sm border border-border">
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm">{stat.emoji}</span>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={data[stat.field] || 0}
                  onChange={(e) =>
                    updateField(stat.field, Number(e.target.value))
                  }
                  className="text-xl font-black italic bg-background border border-border rounded-lg px-1 w-full text-center outline-none text-foreground"
                />
              ) : (
                <p className="text-xl font-black italic text-foreground">
                  {data[stat.field] || 0}
                  <span className="text-[10px] ml-0.5 opacity-50">
                    {stat.unit}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
