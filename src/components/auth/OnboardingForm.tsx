import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { ChevronRight, User, Ruler, Weight, Activity, Target } from "lucide-react";

const onboardingSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  weight: z.number().min(20).max(500),
  height: z.number().min(50).max(300),
  activity_level: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active"
  ]),
  goal: z.enum(["weight_loss", "maintenance", "cut", "bulk"])
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const activityFactors = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

const goalAdjustments = {
  weight_loss: -500,
  cut: -300,
  maintenance: 0,
  bulk: 300
};

export const OnboardingForm: React.FC<{
  onComplete: (tdee: number) => void;
}> = ({ onComplete }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      goal: "maintenance"
    }
  });

  const onSubmit = async (data: OnboardingData) => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
    if (data.gender === "male") {
      bmr += 5;
    } else if (data.gender === "female") {
      bmr -= 161;
    } else {
      bmr -= 78; // Neutral average
    }

    const maintenanceCalories = bmr * activityFactors[data.activity_level];
    const targetCalories = Math.round(maintenanceCalories + goalAdjustments[data.goal]);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      activity_level: data.activity_level,
      goal: data.goal,
      tdee: targetCalories
    });

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      onComplete(targetCalories);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-2 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="space-y-4">
        <h2 className="text-5xl font-black tracking-tighter text-foreground leading-[0.9]">
          Let's get <br />
          <span className="text-secondary italic">Started.</span>
        </h2>
        <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">
          Set up your profile to calculate TDEE
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* Goal selection (New) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">
              <Target className="w-3 h-3" /> Your Goal
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'weight_loss', label: 'Weight Loss', desc: '-500 kcal' },
                { id: 'cut', label: 'Cut', desc: '-300 kcal' },
                { id: 'maintenance', label: 'Maintain', desc: '0 kcal' },
                { id: 'bulk', label: 'Bulk', desc: '+300 kcal' }
              ].map((item) => (
                <label key={item.id} className="relative group cursor-pointer">
                  <input
                    type="radio"
                    {...register("goal")}
                    value={item.id}
                    className="peer sr-only"
                  />
                  <div className="h-20 bg-muted/50 rounded-xl p-4 flex flex-col justify-center border-2 border-transparent peer-checked:border-primary peer-checked:bg-card transition-all group-hover:bg-muted peer-checked:group-hover:bg-card">
                    <span className="font-black text-xs uppercase tracking-wider text-foreground leading-tight">
                      {item.label}
                    </span>
                    <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Age & Gender Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">
                <User className="w-3 h-3" /> Age
              </label>
              <input
                type="number"
                {...register("age", { valueAsNumber: true })}
                placeholder="25"
                className="w-full h-16 bg-card rounded-xl px-6 font-black text-xl border border-border focus:border-primary focus:bg-card transition-all outline-none text-foreground placeholder:text-muted-foreground/30"
              />
              {errors.age && (
                <p className="text-destructive text-[10px] font-bold ml-4">
                  {errors.age.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full h-16 bg-card rounded-xl px-6 font-black text-lg border border-border focus:border-primary focus:bg-card transition-all outline-none appearance-none text-foreground"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Weight & Height Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">
                <Weight className="w-3 h-3" /> Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
                placeholder="70.5"
                className="w-full h-16 bg-card rounded-xl px-6 font-black text-xl border border-border focus:border-primary focus:bg-card transition-all outline-none text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">
                <Ruler className="w-3 h-3" /> Height (cm)
              </label>
              <input
                type="number"
                {...register("height", { valueAsNumber: true })}
                placeholder="175"
                className="w-full h-16 bg-card rounded-xl px-6 font-black text-xl border border-border focus:border-primary focus:bg-card transition-all outline-none text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">
              <Activity className="w-3 h-3" /> Activity Level
            </label>
            <select
              {...register("activity_level")}
              className="w-full h-20 bg-card rounded-xl px-6 font-black text-lg border border-border focus:border-primary focus:bg-card transition-all outline-none appearance-none text-foreground"
            >
              <option value="sedentary">Sedentary (No exercise)</option>
              <option value="lightly_active">Lightly Active (1-3 days)</option>
              <option value="moderately_active">
                Moderately Active (3-5 days)
              </option>
              <option value="very_active">Very Active (6-7 days)</option>
              <option value="extra_active">Extra Active (Hard work)</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl h-20 group transition-all"
        >
          {isSubmitting ? (
            "Optimizing..."
          ) : (
            <div className="flex items-center gap-3">
              Calculate TDEE
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};
