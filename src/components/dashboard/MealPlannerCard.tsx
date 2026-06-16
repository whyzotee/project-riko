import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useMealPlanStore, type Meal } from "../../store/useMealPlanStore";
import { generateMealPlanFromAPI, generateSingleMealFromAPI } from "../../lib/mealPlannerAgent";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, Check, Utensils, AlertCircle } from "lucide-react";
import { MealRowItem } from "./MealRowItem";

interface MealPlannerCardProps {
  todayStr: string;
  onMealLogged: () => void;
  tdee: number;
}

export const MealPlannerCard: React.FC<MealPlannerCardProps> = ({ todayStr, onMealLogged, tdee }) => {
  const { session } = useAppStore();
  const { mealPlans, loading, error, setMealPlan, updateMeal, setLoading, setError } = useMealPlanStore();

  const [localMealLoading, setLocalMealLoading] = useState<Record<number, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loggedMeals, setLoggedMeals] = useState<Record<string, boolean>>({});

  const currentPlan = mealPlans[todayStr];

  const getUserName = () => {
    if (session?.user?.user_metadata?.full_name) return session.user.user_metadata.full_name as string;
    if (session?.user?.user_metadata?.name) return session.user.user_metadata.name as string;
    if (session?.user?.email) return session.user.email.split("@")[0];
    return "คนเก่ง";
  };

  const handleGeneratePlan = async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);
    try {
      const username = getUserName();
      const plan = await generateMealPlanFromAPI(todayStr, username, tdee);
      setMealPlan(todayStr, plan);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถดึงข้อมูลตารางอาหารได้ ลองใหม่อีกครั้งนะคะ 🥺");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMeal = async (index: number, meal: Meal) => {
    if (!session?.user || !currentPlan) return;
    setLocalMealLoading((prev) => ({ ...prev, [index]: true }));
    try {
      const username = getUserName();
      const newMeal = await generateSingleMealFromAPI(todayStr, meal.type, meal.name, username, tdee);
      updateMeal(todayStr, index, newMeal);
      
      // Clear logged state for this meal slot since it's a new meal
      const loggedKey = `${index}-${newMeal.name}`;
      setLoggedMeals((prev) => ({ ...prev, [loggedKey]: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setLocalMealLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleLogMeal = async (meal: Meal, index: number) => {
    if (!session?.user) return;
    const loggedKey = `${index}-${meal.name}`;
    if (loggedMeals[loggedKey]) return; // Already logged

    try {
      const { error: insertErr } = await supabase.from("calorie_logs").insert({
        user_id: session.user.id,
        food_name: `${meal.name} (${meal.location})`,
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        carbs: meal.carbs,
      });

      if (insertErr) throw insertErr;

      setLoggedMeals((prev) => ({ ...prev, [loggedKey]: true }));
      setSuccessMsg(`บันทึก ${meal.name} ลงไดอารี่แล้วค่ะ! 😋💖`);
      onMealLogged();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert("บันทึกข้อมูลอาหารไม่สำเร็จ ลองใหม่อีกครั้งนะคะ");
    }
  };

  const totalNutrition = currentPlan?.meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.protein;
      acc.fat += meal.fat;
      acc.carbs += meal.carbs;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return (
    <section className="bg-card rounded-2xl border border-border p-8 sm:p-10 space-y-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-secondary/15 rounded-xl flex items-center justify-center text-secondary">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-foreground text-base">
              วันนี้กินอะไรดี? 🍽️
            </h4>
            <p className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
              Riko's Daily Meal Planner
            </p>
          </div>
        </div>

        {currentPlan && !loading && (
          <button
            onClick={() => handleGeneratePlan()}
            className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors animate-in fade-in duration-300"
            title="รีเฟรชตารางอาหารทั้งหมด"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 space-y-3"
          >
            <div className="relative">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <Sparkles className="w-5 h-5 text-secondary absolute -top-1 -right-1 animate-bounce" />
            </div>
            <p className="text-xs font-bold text-muted-foreground animate-pulse">
              ริโกะกำลังเลือกสรรเมนูอร่อยให้คุณอยู่นะคะ... 🎀
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="flex-1">{error}</p>
            <button onClick={() => handleGeneratePlan()} className="underline hover:no-underline font-bold">
              ลองใหม่
            </button>
          </motion.div>
        ) : !currentPlan ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted/40 border border-dashed border-border rounded-xl p-6 text-center space-y-4"
          >
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              ยังไม่มีตารางแนะนำอาหารสำหรับวันนี้ ให้ริโกะช่วยจัดตารางอร่อยๆ ไม่ว่าจะเป็นร้านข้าวแกง ก๋วยเตี๋ยว อาหารตามสั่ง หรือของกินใน 7-11 ให้คนเก่งนะคะ 🥗💖
            </p>
            <button
              onClick={() => handleGeneratePlan()}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-102 active:scale-98"
            >
              จัดตารางอาหารแนะนำวันนี้ ✨
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Riko Chat Bubble */}
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/15 relative">
              <div className="absolute -top-1.5 left-6 w-3 h-3 bg-primary/5 border-t border-l border-primary/15 rotate-45"></div>
              <p className="text-xs text-foreground font-bold leading-relaxed italic">
                "{currentPlan.rikoComment}"
              </p>
            </div>

            {/* Success Toast Inside Card */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-success/10 border border-success/20 text-success text-xs font-black p-3 rounded-xl flex items-center gap-2"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Meals List */}
            <div className="space-y-3">
              {currentPlan.meals.map((meal, index) => {
                const loggedKey = `${index}-${meal.name}`;
                return (
                  <MealRowItem
                    key={index}
                    meal={meal}
                    isLogged={!!loggedMeals[loggedKey]}
                    isMealLoading={!!localMealLoading[index]}
                    onRefresh={() => handleRefreshMeal(index, meal)}
                    onLog={() => handleLogMeal(meal, index)}
                  />
                );
              })}
            </div>

            {/* Total Nutrients Card Summary */}
            {totalNutrition && (
              <div className="bg-muted/20 border border-border p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                  สรุปสารอาหารรวมจากเมนูแนะนำ
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xs font-black text-foreground italic tabular-nums leading-none">
                      {totalNutrition.calories}
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">kcal</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground italic tabular-nums leading-none">
                      {totalNutrition.protein}g
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Protein</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground italic tabular-nums leading-none">
                      {totalNutrition.carbs}g
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Carbs</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground italic tabular-nums leading-none">
                      {totalNutrition.fat}g
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Fat</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
