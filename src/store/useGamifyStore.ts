import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface WorkoutDay {
  gym: boolean
  walk: boolean
  steps10k?: boolean
}

export interface Reward {
  id: string
  name: string
  points: number
  emoji: string
  isCustom?: boolean
}

export interface RedeemedItem {
  id: string
  rewardId: string
  name: string
  points: number
  emoji: string
  redeemedAt: string
}

interface GamifyState {
  points: number
  streak: number
  history: Record<string, WorkoutDay> // Key: YYYY-MM-DD
  customRewards: Reward[]
  redeemedHistory: RedeemedItem[]
  chatHistory: Array<{ sender: "user" | "riko"; text: string }>
  
  // Actions
  setGamifyData: (data: {
    points: number
    streak: number
    history: Record<string, WorkoutDay>
    customRewards: Reward[]
    redeemedHistory: RedeemedItem[]
  }) => void
  toggleGym: (dateStr: string) => void
  toggleWalk: (dateStr: string) => void
  toggleSteps10k: (dateStr: string) => void
  addPoints: (amount: number) => void
  addCustomReward: (name: string, points: number, emoji: string) => void
  deleteCustomReward: (id: string) => void
  redeemReward: (reward: Reward) => boolean
  recalculateStreak: () => void
  addChatMessage: (msg: { sender: "user" | "riko"; text: string }) => void
  clearChatHistory: (customMessage?: string) => void
}

const syncToSupabase = async (
  points: number,
  streak: number,
  history: Record<string, WorkoutDay>,
  customRewards: Reward[],
  redeemedHistory: RedeemedItem[]
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return

    const { error } = await supabase
      .from('profiles')
      .update({
        points,
        streak,
        workout_history: history,
        custom_rewards: customRewards,
        redeemed_history: redeemedHistory,
      })
      .eq('id', userId)

    if (error) {
      console.error('Error syncing gamify data to supabase:', error)
    }
  } catch (err) {
    console.error('Failed to sync to Supabase:', err)
  }
}

export const useGamifyStore = create<GamifyState>()(
  persist(
    (set, get) => ({
      points: 350, // Starting points
      streak: 0,
      history: {},
      customRewards: [],
      redeemedHistory: [],
      chatHistory: [
        {
          sender: "riko",
          text: "สวัสดีค่ะ! โค้ชริโกะยินดีที่ได้คุยกับคุณในวันนี้น้า 🎀 วันนี้เหนื่อยไหมคะ? หรือมีอะไรอยากปรึกษาเรื่องฟิตเนส การกิน หรือการออกกำลังกาย ถามริโกะได้เลยนะ!"
        }
      ],

      setGamifyData: (data) => {
        set({
          points: data.points,
          streak: data.streak,
          history: data.history,
          customRewards: data.customRewards,
          redeemedHistory: data.redeemedHistory,
        })
      },

      toggleGym: (dateStr) => {
        set((state) => {
          const day = state.history[dateStr] || { gym: false, walk: false, steps10k: false }
          const newGym = !day.gym
          const pointsDiff = newGym ? 100 : -100
          
          const newHistory = {
            ...state.history,
            [dateStr]: { ...day, gym: newGym },
          }

          // If gym is unchecked, walk is unchecked and steps10k is unchecked, delete the entry to keep history clean
          if (!newGym && !day.walk && !day.steps10k) {
            delete newHistory[dateStr]
          }

          return {
            history: newHistory,
            points: Math.max(0, state.points + pointsDiff),
          }
        })
        get().recalculateStreak()
        const state = get()
        syncToSupabase(state.points, state.streak, state.history, state.customRewards, state.redeemedHistory)
      },

      toggleWalk: (dateStr) => {
        set((state) => {
          const day = state.history[dateStr] || { gym: false, walk: false, steps10k: false }
          const newWalk = !day.walk
          const pointsDiff = newWalk ? 50 : -50

          const newHistory = {
            ...state.history,
            [dateStr]: { ...day, walk: newWalk },
          }

          if (!day.gym && !newWalk && !day.steps10k) {
            delete newHistory[dateStr]
          }

          return {
            history: newHistory,
            points: Math.max(0, state.points + pointsDiff),
          }
        })
        get().recalculateStreak()
        const state = get()
        syncToSupabase(state.points, state.streak, state.history, state.customRewards, state.redeemedHistory)
      },

      toggleSteps10k: (dateStr) => {
        set((state) => {
          const day = state.history[dateStr] || { gym: false, walk: false, steps10k: false }
          const newSteps = !day.steps10k
          const pointsDiff = newSteps ? 50 : -50

          const newHistory = {
            ...state.history,
            [dateStr]: { ...day, steps10k: newSteps },
          }

          if (!day.gym && !day.walk && !newSteps) {
            delete newHistory[dateStr]
          }

          return {
            history: newHistory,
            points: Math.max(0, state.points + pointsDiff),
          }
        })
        get().recalculateStreak()
        const state = get()
        syncToSupabase(state.points, state.streak, state.history, state.customRewards, state.redeemedHistory)
      },

      addPoints: (amount) => {
        set((state) => ({ points: Math.max(0, state.points + amount) }))
        const state = get()
        syncToSupabase(state.points, state.streak, state.history, state.customRewards, state.redeemedHistory)
      },

      addCustomReward: (name, points, emoji) => {
        set((state) => ({
          customRewards: [
            ...state.customRewards,
            {
              id: `custom-${Date.now()}`,
              name,
              points,
              emoji,
              isCustom: true,
            },
          ],
        }))
        const state = get()
        syncToSupabase(state.points, state.streak, state.history, state.customRewards, state.redeemedHistory)
      },

      deleteCustomReward: (id) => {
        set((state) => ({
          customRewards: state.customRewards.filter((r) => r.id !== id),
        }))
        const state = get()
        syncToSupabase(state.points, state.streak, state.history, state.customRewards, state.redeemedHistory)
      },

      redeemReward: (reward) => {
        const { points, redeemedHistory } = get()
        if (points < reward.points) return false

        const newRedeemedItem: RedeemedItem = {
          id: `redeemed-${Date.now()}`,
          rewardId: reward.id,
          name: reward.name,
          points: reward.points,
          emoji: reward.emoji,
          redeemedAt: new Date().toISOString(),
        }

        set({
          points: points - reward.points,
          redeemedHistory: [newRedeemedItem, ...redeemedHistory],
        })

        const state = get()
        syncToSupabase(state.points, state.streak, state.history, state.customRewards, state.redeemedHistory)
        return true
      },

      recalculateStreak: () => {
        const { history } = get()
        const today = new Date()
        let currentStreak = 0
        let dateToCheck = new Date(today)

        // Reset hours for comparison
        dateToCheck.setHours(0, 0, 0, 0)

        // Check if today has at least one workout
        const todayStr = formatLocalDate(dateToCheck)
        const todayWorkout = history[todayStr]
        const hasWorkoutToday = todayWorkout && (todayWorkout.gym || todayWorkout.walk || todayWorkout.steps10k)

        // If no workout today, we check if they did yesterday to maintain streak
        let isStreakBroken = false
        let checkDate = new Date(dateToCheck)
        
        if (!hasWorkoutToday) {
          checkDate.setDate(checkDate.getDate() - 1)
        }

        while (!isStreakBroken) {
          const dateStr = formatLocalDate(checkDate)
          const dayWorkout = history[dateStr]
          const workedOut = dayWorkout && (dayWorkout.gym || dayWorkout.walk || dayWorkout.steps10k)

          if (workedOut) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            isStreakBroken = true
          }
        }

        set({ streak: currentStreak })
      },

      addChatMessage: (msg) => {
        set((state) => ({
          chatHistory: [...state.chatHistory, msg]
        }))
      },

      clearChatHistory: (customMessage) => {
        const defaultMessage = "สวัสดีค่ะ! โค้ชริโกะยินดีที่ได้คุยกับคุณในวันนี้น้า 🎀 วันนี้เหนื่อยไหมคะ? หรือมีอะไรอยากปรึกษาเรื่องฟิตเนส การกิน หรือการออกกำลังกาย ถามริโกะได้เลยนะ!";
        set({
          chatHistory: [
            {
              sender: "riko",
              text: customMessage || defaultMessage
            }
          ]
        })
      },
    }),
    {
      name: 'cal-free-gamify-store',
    }
  )
)
