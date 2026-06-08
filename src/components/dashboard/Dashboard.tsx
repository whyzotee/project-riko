import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useGamifyStore } from "../../store/useGamifyStore";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import rikoImg from "../../assets/riko.png";

import { PointsCard } from "./PointsCard";
import { WeeklyGymRoutine } from "./WeeklyGymRoutine";
import { WorkoutHeatmap } from "./WorkoutHeatmap";
import { WorkoutCheckin } from "./WorkoutCheckin";
import { RewardShop } from "./RewardShop";
import { DietDiaryCard } from "./DietDiaryCard";
import { CoachRikoChat } from "./CoachRikoChat";
import type { Reward } from "../../store/useGamifyStore";

interface Log {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateThai = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    month: "short",
    day: "numeric",
    weekday: "short"
  });
};

export const Dashboard: React.FC<{ tdee: number }> = ({ tdee }) => {
  const {
    points,
    streak,
    history,
    toggleGym,
    toggleWalk,
    toggleSteps10k
  } = useGamifyStore();

  const [logs, setLogs] = useState<Log[]>([]);
  const todayStr = formatLocalDate(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [showChat, setShowChat] = useState(false);
  const [motivationToggle, setMotivationToggle] = useState(0);
  const [redeemedToast, setRedeemedToast] = useState<{ show: boolean; name: string; emoji: string } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationToggle((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { data, error } = await supabase
          .from("calorie_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString())
          .order("created_at", { ascending: false });

        if (!error && data) {
          setLogs(data as Log[]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, []);

  const consumedCalories = logs.reduce((sum, log) => sum + Number(log.calories), 0);
  const remainingCalories = Math.max(0, tdee - consumedCalories);

  const getGridDays = () => {
    const today = new Date();
    const startSunday = new Date(today);
    startSunday.setDate(today.getDate() - today.getDay() - 4 * 7);
    startSunday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 5 * 7; i++) {
      const d = new Date(startSunday);
      d.setDate(startSunday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const gridDays = getGridDays();
  const activeWorkoutDay = history[selectedDateStr] || { gym: false, walk: false, steps10k: false };

  const handleRedeemSuccess = (reward: Reward) => {
    setRedeemedToast({ show: true, name: reward.name, emoji: reward.emoji });
    setTimeout(() => setRedeemedToast(null), 3000);
  };

  const getTodayRoutine = () => {
    const dayOfWeek = new Date().getDay();
    const routines = {
      1: "อก + หลังแขน 🏋️",
      2: "หลัง + หน้าแขน 💪",
      3: "พัก หรือ เดิน 10,000 ก้าว 👟",
      4: "ไหล่ + ขา 🦵",
      5: "อก + หลัง 🔥",
      6: "เก็บตก หรือ เดิน 10,000 ก้าว 🚶",
      0: "พักผ่อนเต็มที่ 😴",
    };
    return routines[dayOfWeek as keyof typeof routines] || "พักผ่อนเต็มที่ 😴";
  };

  const getPrimaryMessage = () => {
    const todayWorkout = history[todayStr];
    const gymDone = todayWorkout?.gym;
    const walkDone = todayWorkout?.walk;

    if (gymDone && walkDone) {
      return "สุดยอดมากเลยค่ะ! วันนี้ออกกำลังกายครบถ้วนทั้งสองอย่างแล้ว! ริโกะภูมิใจในตัวคุณสุดๆ เลยนะ พักผ่อนให้เต็มที่นะคะคนเก่ง 💖";
    }
    if (gymDone || walkDone) {
      return "เก่งมากเลยค่ะ! ได้ออกกำลังกายไป 1 อย่างแล้ว อีกนิดเดียวจะครบเซ็ตของวันนี้แล้วนะ มาลุยอีกนิดกันเถอะ ริโกะเอาใจช่วยอยู่! 🔥";
    }
    if (streak >= 3) {
      return `รักษาสถิติความเก่งนี้ไว้กันเถอะค่ะ ทำต่อเนื่องมา ${streak} วันแล้วน้า วันนี้มาขยับตัวด้วยกันเถอะนะคะ! ✨`;
    }
    return "วันนี้ยังไม่ได้ออกกำลังกายเลยน้า... ขยับตัวยืดเส้นยืดสายเข้ายิมหรือเดินชันสักนิด ริโกะรอกดปุ่มเช็คอินให้อยู่นะคะ! 🥺🎀";
  };

  const getSecondaryMessage = () => {
    const todayWorkout = history[todayStr];
    const gymDone = todayWorkout?.gym;
    const walkDone = todayWorkout?.walk;
    const routine = getTodayRoutine();

    if (gymDone && walkDone) {
      return `เย้! เคลียร์ตารางสำหรับโปรแกรม 【${routine}】 วันนี้เรียบร้อย! คนเก่งของริโกะสุดยอดที่สุดเลยยย 🎉🏆`;
    }
    if (gymDone || walkDone) {
      return `วันนี้ในตารางมีโปรแกรม 【${routine}】 น้า ลุยไปได้ส่วนนึงแล้ว อีกนิดเดียวสู้ๆ ค่ะ! 💪✨`;
    }
    
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || (dayOfWeek === 3 && !gymDone && !walkDone) || (dayOfWeek === 6 && !gymDone && !walkDone)) {
      return `วันนี้ตามตารางบอกว่า 【${routine}】 ยืดเส้นยืดสายหรือพักผ่อนให้มีความสุขนะคะ ริโกะรอเชียร์อยู่เสมอน้า 🎀🧸`;
    }
    
    return `วันนี้ในตารางบอกว่าต้องเล่น 【${routine}】 นะคะ! ไปยืดเส้นยืดสายเข้ายิมกันเถอะ ริโกะคอยเชียร์อยู่นะนั่นน่ะ! 🥺🏋️`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 pb-12 relative"
    >
      <AnimatePresence>
        {redeemedToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-6 left-1/2 z-50 bg-card text-foreground px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-border"
          >
            <div className="text-2xl">{redeemedToast.emoji}</div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground leading-none mb-1">Redeemed!</p>
              <p className="font-black italic text-sm text-foreground">{redeemedToast.name}</p>
            </div>
            <Sparkles className="w-5 h-5 text-gold fill-gold animate-bounce ml-2" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground italic leading-none uppercase">
            Quest
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
            <p className="text-muted-foreground font-black text-[9px] tracking-[0.2em] uppercase">
              Fitness Gamified
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full border border-border">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-xs font-black tracking-tight italic text-foreground">{streak} วัน</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-5 border border-primary/20 flex items-center gap-4 relative overflow-hidden">
        <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-primary/20 bg-background/50 shadow-lg">
          <img
            src={rikoImg}
            alt="Riko"
            className="w-full h-full object-cover object-top scale-105 hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-[9px] font-black tracking-[0.2em] text-secondary uppercase flex items-center gap-1.5">
            Coach Riko 🎀
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          </span>
          <div className="min-h-[48px] overflow-hidden flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={motivationToggle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-foreground font-bold text-xs sm:text-sm leading-relaxed"
              >
                "{motivationToggle === 0 ? getPrimaryMessage() : getSecondaryMessage()}"
              </motion.p>
            </AnimatePresence>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(true)}
            className="mt-2 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-secondary hover:text-white text-[10px] font-black uppercase tracking-wider rounded-full border border-primary/30 flex items-center gap-1.5 w-fit transition-all duration-300"
          >
            คุยกับริโกะ 💬
          </motion.button>
        </div>
      </div>

      <WeeklyGymRoutine history={history} todayStr={todayStr} />

      <WorkoutHeatmap
        gridDays={gridDays}
        selectedDateStr={selectedDateStr}
        setSelectedDateStr={setSelectedDateStr}
        history={history}
        todayStr={todayStr}
        formatLocalDate={formatLocalDate}
        formatDateThai={formatDateThai}
      />

      <WorkoutCheckin
        selectedDateStr={selectedDateStr}
        todayStr={todayStr}
        activeWorkoutDay={activeWorkoutDay}
        toggleGym={toggleGym}
        toggleWalk={toggleWalk}
        toggleSteps10k={toggleSteps10k}
        formatDateThai={formatDateThai}
      />

      <PointsCard points={points} streak={streak} />

      <RewardShop onRedeemSuccess={handleRedeemSuccess} />

      <DietDiaryCard consumedCalories={consumedCalories} remainingCalories={remainingCalories} tdee={tdee} />

      <CoachRikoChat showChat={showChat} setShowChat={setShowChat} tdee={tdee} logs={logs} />
    </motion.div>
  );
};
