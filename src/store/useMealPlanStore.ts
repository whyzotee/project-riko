import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  location: string;
}

export interface DailyMealPlan {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  rikoComment?: string;
}

interface MealPlanState {
  mealPlans: Record<string, DailyMealPlan>; // key is dateStr (YYYY-MM-DD)
  loading: boolean;
  error: string | null;
  
  // Actions
  setMealPlan: (dateStr: string, plan: DailyMealPlan) => void;
  updateMeal: (dateStr: string, mealIndex: number, newMeal: Meal) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set) => ({
      mealPlans: {},
      loading: false,
      error: null,

      setMealPlan: (dateStr, plan) => {
        set((state) => ({
          mealPlans: {
            ...state.mealPlans,
            [dateStr]: plan
          }
        }))
      },

      updateMeal: (dateStr, mealIndex, newMeal) => {
        set((state) => {
          const plan = state.mealPlans[dateStr];
          if (!plan) return {};

          const updatedMeals = [...plan.meals];
          updatedMeals[mealIndex] = newMeal;

          return {
            mealPlans: {
              ...state.mealPlans,
              [dateStr]: {
                ...plan,
                meals: updatedMeals
              }
            }
          };
        });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearCache: () => set({ mealPlans: {} })
    }),
    {
      name: 'riko-meal-plan-store',
    }
  )
)
