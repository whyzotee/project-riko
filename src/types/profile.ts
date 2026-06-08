import type { Session } from '@supabase/supabase-js'

export interface Profile {
  id: string;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female" | "other";
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extra_active";
  goal: "weight_loss" | "maintenance" | "cut" | "bulk";
  tdee: number;
  updated_at?: string;
  points?: number;
  streak?: number;
  custom_rewards?: Array<{ id: string; name: string; points: number; emoji: string; isCustom?: boolean }>;
  redeemed_history?: Array<{ id: string; rewardId: string; name: string; points: number; emoji: string; redeemedAt: string }>;
}

export interface MyRouterContext {
  session: Session | null
  profile: Profile | null
}
