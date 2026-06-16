# Project: Gamified Fitness & Reward Tracker PWA (Premium "Dropset" Style) - Project Riko

## 🎯 Overall Goal
Build a high-performance, premium-feel (iOS/Dropset style) Gamified Fitness & Reward Tracker PWA using Bun, React, Tailwind v4, Supabase, and Gemini 3.1 Flash-Lite. The app rewards users with points for exercising (Gym and Incline Walk), which can be redeemed for food rewards (Shabu, Bubble Tea). It features a GitHub-style workout contribution grid, streak tracking, and turns the calorie logger into a supporting/secondary feature.

## 🛠 Active Constraints
- **Runtime**: Bun. Imports use `@/` for `src/`.
- **Mobile Mandate**: All screens must be fully functional at 375px width (iPhone SE).
- **Layout**: Vertical stacking (`grid-cols-1`) on mobile; standardized rounding (`rounded-2xl`, `rounded-xl`).
- **Typography**: Consistent "Dropset" headers for "Quest", "Stats", and "Profile" using `text-4xl font-black tracking-tight italic`.
- **Spacing**: Standardized responsive padding at `px-6 sm:px-10` for main content containers and `p-8 sm:p-10` for cards.
- **Scroll Behavior**: Reset `main` container scroll to (0,0) on route changes via `useLocation` in `__root.tsx`.
- **Loading Pattern**: Standardized "Thinking..." centered animation across all pages using `Loader2` and `Sparkles`.
- **File Length Constraint**: All component and store files must be modular. No single file in the project may exceed 300 lines of code.
- **Folder Structure Constraint**: In `src/components/`, subcomponents must be organized and divided into subfolders by page or feature (e.g. `auth/`, `scan/`, `dashboard/`, `logs/`, `overview/`, `profile/`, `layout/`) to maintain codebase cleanliness.

## 🧠 Key Knowledge
- **Gamification**: Accumulate points by completing workouts (Gym: +100 PTS, Incline Walk: +50 PTS) for selected dates.
- **Workout Heatmap**: Displays a GitHub contribution style grid (emerald green colors) showing workout history over the last 18 weeks. Gray for no workout, light green for one workout, dark green for both workouts.
- **Reward Shop**: Points can be redeemed for treats (e.g. Shabu, Bubble Tea) or custom user-defined rewards. Redeeming deducts points and logs to history.
- **Secondary Calorie Logging**: Calorie logs, macros, and TDEE calculation are retained as secondary helper features linked at the bottom of the main dashboard.
- **Mascot Coach**: Coach Riko (`src/assets/riko.png`) dynamically cheers the user on the dashboard based on their daily workout progress and current streak.
- **Architecture**: Zustand stores (`useAppStore` for auth/profile, `useGamifyStore` with persist middleware for workout records, points, and rewards).

## 🛠 Artifact Trail
- `src/store/useGamifyStore.ts`: Zustand store managing workout checkins, points, custom rewards, and redemption history.
- `src/components/Dashboard.tsx`: Redesigned gamified main dashboard featuring the points tracker, contribution grid, Coach Riko encouragement card, workout checkins, reward shop, and secondary calorie logs.
- `src/routes/__root.tsx`: Updated bottom navigation, renaming the home tab to "Quest" with a `Trophy` icon.

## 📅 Task State
1. [DONE] Setup Gamified Zustand Store (`useGamifyStore.ts`).
2. [DONE] Design & Build Workout Heatmap (GitHub-style grid).
3. [DONE] Build Workout Check-in Controls (Gym + Incline Walk).
4. [DONE] Build Reward Shop (Redeem points for treats + custom rewards).
5. [DONE] Demote Calorie tracker to a supporting/secondary card on Dashboard.
6. [TODO] Add custom exercises with custom point settings.
7. [DONE] Implement Supabase persistence and synchronization for all gamification features.
8. [DONE] Optimize WebKit fast-scrolling (native scroll transition) and disable double-tap/pinch-to-zoom (viewport meta + touch-action manipulation).
9. [DONE] Integrate PWA Auto-Update configuration in Vite PWA plugin (`vite.config.ts`).
10. [DONE] Add persistent chat logs in Zustand store, randomized personalized greetings (addressing user by name), and dynamic chatbot context (today's gym routine, calorie logs, and macros).
11. [DONE] Implement client-side sequential model fallback retry loop (Gemini 2.5 Flash -> 2.5 Lite -> 2.0 Lite -> Gemma 4 26B) on quota limit (429) errors.
12. [DONE] Refactor code to ensure no single file exceeds 300 lines and fix all compiler/linter warnings.

13. [DONE] Deprecate and drop `workout_history` column from `profiles` table in SQL schema and TypeScript typings since records are stored relationally in `workout_records`.
14. [DONE] Build Daily Meal Planner with local caching, single-meal refresh, and direct calorie logging for Thai street foods / 7-Eleven.

---
*Last Updated: Monday, June 8, 2026*

