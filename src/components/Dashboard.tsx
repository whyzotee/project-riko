import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "@tanstack/react-router";
import { useGamifyStore } from "../store/useGamifyStore";
import type { Reward } from "../store/useGamifyStore";
import { useAppStore } from "../store/useAppStore";
import rikoImg from "../assets/riko.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  ChevronRight,
  Plus,
  Flame,
  Coins,
  Dumbbell,
  Trash2,
  Sparkles,
  Check,
  Calendar,
  Send,
  X
} from "lucide-react";
import { cn } from "../lib/utils";

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

export const Dashboard: React.FC<{ tdee: number }> = ({ tdee }) => {
  const { session } = useAppStore();
  const {
    points,
    streak,
    history,
    customRewards,
    redeemedHistory,
    chatHistory,
    toggleGym,
    toggleWalk,
    toggleSteps10k,
    addCustomReward,
    deleteCustomReward,
    redeemReward,
    addChatMessage,
    clearChatHistory
  } = useGamifyStore();

  const getUserName = () => {
    if (session?.user?.user_metadata?.full_name) {
      return session.user.user_metadata.full_name;
    }
    if (session?.user?.user_metadata?.name) {
      return session.user.user_metadata.name;
    }
    if (session?.user?.email) {
      return session.user.email.split("@")[0];
    }
    return "คนเก่ง";
  };

  const getRandomGreeting = (name: string) => {
    const greetings = [
      `สวัสดีค่ะคุณ ${name}! วันนี้เหนื่อยไหมคะ? โค้ชริโกะพร้อมคุยและให้คำแนะนำดีๆ เรื่องออกกำลังกายและอาหารการกินแล้วน้า มีอะไรระบายหรือถามริโกะได้เลยนะ! 🎀🥺💖`,
      `เย้! ดีใจจังที่ได้คุยกับคุณ ${name} อีกครั้งน้า วันนี้ฟิตร่างกายมาหรือยังคะ? หรือถ้ากำลังมีเรื่องท้อใจ คุยกับริโกะได้เสมอนะคะ ริโกะพร้อมส่งพลังบวกให้เต็มที่เลย! 🏋️‍♀️💪✨`,
      `ฮั่นแน่! วันนี้กินของอร่อยอะไรมาหรือยังคะคุณ ${name} 🎀 มาสะสมแต้มแคลฟรีเพื่อไปแลกรางวัลกันเถอะค่ะ! วันนี้มีอะไรอยากปรึกษาเรื่องฟิตเนสถามริโกะได้เลยน้า 💖🧋`,
      `สวัสดีค่ะคุณ ${name} ริโกะสแตนด์บายรอเชียร์อยู่แล้วน้า! วันนี้มาชาเลนจ์ยิมหรือเดินชันดีคะ? คุยกับริโกะได้ทุกเรื่องเลยนะคะ ไม่ว่าจะกินหลุดหรือเหนื่อยแค่ไหนก็ตาม 🥺🎀`,
      `สวัสดีค่ะคุณ ${name} โค้ชริโกะสแตนด์บายแล้วค่ะ! วันนี้เป้าหมายสุขภาพเป็นอย่างไรบ้างคะ? เล่าให้ริโกะฟังหน่อยน้า ริโกะพร้อมคอยช่วยแนะแนวและเป็นกำลังใจให้เสมอเลย! 💖💪`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Calorie logs states (secondary feature)
  const [logs, setLogs] = useState<Log[]>([]);

  // Gamify UI states
  const todayStr = formatLocalDate(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [showAddReward, setShowAddReward] = useState(false);
  const [showRankDetails, setShowRankDetails] = useState(false);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState(200);
  const [newRewardEmoji, setNewRewardEmoji] = useState("🍲");
  const [redeemedToast, setRedeemedToast] = useState<{ show: boolean; name: string; emoji: string } | null>(null);

  const [motivationToggle, setMotivationToggle] = useState(0);

  // Toggle Coach Riko motivation message every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationToggle((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Chat with Riko States
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatLoading]);

  // Initialize randomized personalized greeting on chat open if empty or default
  useEffect(() => {
    if (showChat && chatHistory.length <= 1) {
      const username = getUserName();
      const currentGreeting = chatHistory[0]?.text;
      
      const greetingPatternList = [
        "สวัสดีค่ะคุณ",
        "เย้! ดีใจจังที่ได้คุยกับคุณ",
        "ฮั่นแน่! วันนี้กินของอร่อยอะไรมาหรือยังคะคุณ",
        "สวัสดีค่ะ! โค้ชริโกะยินดีที่ได้คุยกับคุณ"
      ];
      
      const isCustomGreetingAlreadySet = currentGreeting && greetingPatternList.some(pattern => 
        currentGreeting.startsWith(pattern) && !currentGreeting.includes("สวัสดีค่ะ! โค้ชริโกะยินดีที่ได้คุยกับคุณในวันนี้น้า")
      );

      if (!isCustomGreetingAlreadySet) {
        const randomGreeting = getRandomGreeting(username);
        clearChatHistory(randomGreeting);
      }
    }
  }, [showChat]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim() || chatLoading) return;

    const newUserMessage = { sender: "user" as const, text: messageText };
    addChatMessage(newUserMessage);
    setChatInput("");
    setChatLoading(true);

    try {
      const formattedHistory = [
        ...chatHistory.map(msg => ({
          role: msg.sender === "user" ? "user" as const : "model" as const,
          parts: [{ text: msg.text }]
        })),
        {
          role: "user" as const,
          parts: [{ text: messageText }]
        }
      ];

      const daysInThai = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
      const todayDayName = daysInThai[new Date().getDay()];
      const weeklyRoutine: Record<string, string> = {
        "จันทร์": "อก + หลังแขน 🏋️",
        "อังคาร": "หลัง + หน้าแขน 💪",
        "พุธ": "พัก หรือ เดิน 10,000 ก้าว 👟",
        "พฤหัสบดี": "ไหล่ + ขา 🦵",
        "ศุกร์": "อก + หลัง 🔥",
        "เสาร์": "เก็บตก หรือ เดิน 10,000 ก้าว 🚶",
        "อาทิตย์": "พักผ่อนเต็มที่ 😴"
      };
      const todayRoutine = weeklyRoutine[todayDayName];

      const foodSummary = logs.length > 0
        ? logs.map(l => `- ${l.food_name} (${l.calories} kcal, โปรตีน ${l.protein || 0}g, ไขมัน ${l.fat || 0}g, คาร์บ ${l.carbs || 0}g)`).join("\n")
        : "ยังไม่มีประวัติการกินอาหารวันนี้";

      const todayWorkout = history[todayStr];
      const workoutInfo = `ข้อมูลผู้ใช้วันนี้:
- ชื่อผู้ใช้งาน: ${getUserName()} (กรุณาทักทายและเรียกผู้ใช้ด้วยชื่อนี้ เพื่อความเป็นกันเองและความสนิทสนม)
- วันนี้คือวัน: ${todayDayName}
- ตารางออกกำลังกายวันนี้คือ: ${todayRoutine}
- เช็คอินเข้ายิมวันนี้: ${todayWorkout?.gym ? `เช็คอินแล้ว (เล่น ${todayRoutine})` : "ยังไม่ได้เช็คอิน"}
- เช็คอินเดินชันวันนี้: ${todayWorkout?.walk ? "เช็คอินแล้ว (เดินชัน)" : "ยังไม่ได้เช็คอิน"}
- เช็คอินเดิน 10,000 ก้าววันนี้: ${todayWorkout?.steps10k ? "เช็คอินแล้ว" : "ยังไม่ได้เช็คอิน"}
- คะแนนสะสมรวม: ${points} แต้ม
- สถิติติดต่อกัน (Streak): ${streak} วัน
- TDEE ของผู้ใช้: ${tdee} kcal
- แคลอรี่รวมที่กินวันนี้: ${consumedCalories} kcal
- สรุปสารอาหารรวมที่กินวันนี้: โปรตีน ${totalProtein.toFixed(1)}g, ไขมัน ${totalFat.toFixed(1)}g, คาร์บ ${totalCarbs.toFixed(1)}g
- รายการอาหารที่กินวันนี้ทั้งหมด:
${foodSummary}

ตารางออกกำลังกายยิมประจำสัปดาห์ (โปรดแนะนำให้ตอบและแนะนำส่วนที่ต้องออกกำลังกายให้สอดคล้องกับตารางนี้):
- วันจันทร์: อก + หลังแขน 🏋️
- วันอังคาร: หลัง + หน้าแขน 💪
- วันพุธ: พัก หรือ เดิน 10,000 ก้าว 👟
- วันพฤหัสบดี: ไหล่ + ขา 🦵
- วันศุกร์: อก + หลัง 🔥
- วันเสาร์: เก็บตก หรือ เดิน 10,000 ก้าว 🚶
- วันอาทิตย์: พักผ่อนเต็มที่ 😴`;

      let responseData = null;
      let invokeError = null;

      try {
        const { data, error } = await supabase.functions.invoke("chat-riko", {
          body: {
            contents: formattedHistory,
            workoutInfo: workoutInfo
          }
        });
        responseData = data;
        invokeError = error;
      } catch (invokeErr: any) {
        invokeError = invokeErr;
      }

      const fallbackModels = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemma-4-26b-it"
      ];

      // If calling Supabase returned a quota error (usually 429), try fallback models in order
      const statusIs429 = invokeError && (
        (invokeError as any).status === 429 ||
        (invokeError.message && invokeError.message.includes("429"))
      );

      if (statusIs429) {
        console.warn("Primary Supabase Edge Function hit quota (429). Retrying with fallback models...");
        for (const model of fallbackModels) {
          try {
            console.info(`Retrying Supabase invoke with model: ${model}`);
            const retryResult = await supabase.functions.invoke("chat-riko", {
              body: {
                contents: formattedHistory,
                workoutInfo: workoutInfo,
                model: model
              }
            });

            if (!retryResult.error && retryResult.data && retryResult.data.text) {
              responseData = retryResult.data;
              invokeError = null;
              break; // Success! Break out of the loop
            } else {
              console.warn(`Fallback model ${model} failed via Supabase:`, retryResult.error);
            }
          } catch (retryErr) {
            console.warn(`Fallback model ${model} threw error:`, retryErr);
          }
        }
      }

      if (invokeError || !responseData || !responseData.text) {
        console.warn("Supabase edge function error, using client fallback", invokeError);
        const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (clientApiKey) {
          const clientModels = [
            "gemini-3.1-flash-lite-preview",
            ...fallbackModels
          ];

          for (const model of clientModels) {
            try {
              const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientApiKey}`;
              console.info(`Trying client fallback with model: ${model}`);
              const fallbackResponse = await fetch(fallbackUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: formattedHistory,
                  systemInstruction: {
                    parts: [{ text: `คุณคือ Coach Riko (โค้ชริโกะ) โค้ชผู้ช่วยฟิตเนสสาวสุดน่ารัก กระตือรือร้น ชอบส่งพลังบวก พูดภาษาไทยอย่างเป็นกันเอง ลงท้ายด้วยคำว่า 'ค่ะ', 'นะคะ', 'น้า' เสมอ และใช้อิโมจิน่ารักๆ ตอบเรื่องสุขภาพ ฟิตเนส แคลอรี่ และการกิน และเรียกผู้ใช้ด้วยชื่อคุณ ${getUserName()} ตลอดเพื่อความสนิทสนม ข้อมูลผู้ใช้วันนี้: ${workoutInfo}` }]
                  }
                })
              });

              if (fallbackResponse.ok) {
                const fallbackResult = await fallbackResponse.json();
                const fallbackText = fallbackResult.candidates[0].content.parts[0].text;
                addChatMessage({ sender: "riko", text: fallbackText });
                setChatLoading(false);
                return; // Success!
              } else {
                console.warn(`Client fallback model ${model} failed with status: ${fallbackResponse.status}`);
              }
            } catch (fallbackErr) {
              console.error(`Client fallback model ${model} threw error:`, fallbackErr);
            }
          }
        }

        // Sim response
        let mockReply = "";
        const lowerText = messageText.toLowerCase();
        if (lowerText.includes("กิน") || lowerText.includes("อาหาร") || lowerText.includes("เมนู")) {
          mockReply = "ช่วงนี้ถ้ากลัวหลุด ลองทานเป็นอกไก่ย่างถ่าน ผัดกะเพราอกไก่น้ำมันน้อย หรือสุกี้น้ำอกไก่ดีไหมคะ? 🥗 ซดซุปร้อนๆ ชื่นใจ และโปรตีนเน้นๆ เลยค่ะ! ส่วนถ้าอยากชานมไข่มุก วันนี้ริโกะอนุญาตให้กินหวานน้อย (25%) เป็นรางวัลตัวเองนะคะคนเก่ง! 🧋✨";
        } else if (lowerText.includes("ออกกำลัง") || lowerText.includes("ยิม") || lowerText.includes("เหนื่อย")) {
          mockReply = "วันนี้ออกกำลังกายสุดยอดไปเลยน้า! โค้ชริโกะภูมิใจในตัวคุณมากเลยค่ะ อย่าลืมดื่มน้ำเยอะๆ และยืดกล้ามเนื้อ (Stretching) ด้วยนะคะ กล้ามเนื้อจะได้ฟื้นฟูไวๆ และสะสมพลังไว้ลุยวันต่อไปกัน! 🏋️💪💖";
        } else {
          mockReply = "ริโกะอยากบอกว่าคุณเก่งมากๆ เลยนะคะที่พยายามรักษาสุขภาพอย่างต่อเนื่องในแอป Project Riko! 🎀 วันนี้มาฟิตร่างกาย สะสมคะแนนไปแลกของอร่อยๆ ทานกันนะคะ ริโกะจะอยู่เคียงข้างคอยเชียร์และเป็นกำลังใจให้เสมอเลยน้า! 🥺💖";
        }

        setTimeout(() => {
          addChatMessage({ sender: "riko", text: mockReply });
          setChatLoading(false);
        }, 1000);
      } else {
        addChatMessage({ sender: "riko", text: responseData.text });
        setChatLoading(false);
      }
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        addChatMessage({
          sender: "riko",
          text: "ริโกะสัญญาณเน็ตขัดข้องนิดหน่อยค่ะ... แต่ใจริโกะยังส่งพลังเชียร์คุณเต็มที่เสมอนะคะ! สู้ๆ น้า! 💖🎀"
        });
        setChatLoading(false);
      }, 1000);
    }
  };

  // Fetch today's calorie logs for secondary feature
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();
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
  const totalProtein = logs.reduce((sum, log) => sum + Number(log.protein || 0), 0);
  const totalFat = logs.reduce((sum, log) => sum + Number(log.fat || 0), 0);
  const totalCarbs = logs.reduce((sum, log) => sum + Number(log.carbs || 0), 0);
  const remainingCalories = Math.max(0, tdee - consumedCalories);

  // Grid calculation: last 5 weeks (35 days)
  const getGridDays = () => {
    const today = new Date();
    // Go back to the Sunday of 4 weeks ago
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

  // Organize weeks for display: 5 columns of 7 days
  const weeks: Date[][] = [];
  for (let i = 0; i < 5; i++) {
    weeks.push(gridDays.slice(i * 7, (i + 1) * 7));
  }

  // Predefined default rewards
  const defaultRewards: Reward[] = [
    { id: "shabu", name: "ชาบูมื้อใหญ่", points: 500, emoji: "🍲" },
    { id: "bubble-tea", name: "ชานมไข่มุกหวานร้อย", points: 150, emoji: "🧋" },
    { id: "bingsu", name: "บิงซูสตรอว์เบอร์รี", points: 250, emoji: "🍧" },
    { id: "mookata", name: "หมูกระทะเยียวยาใจ", points: 450, emoji: "🥩" },
    { id: "pizza", name: "พิซซ่าถาดใหญ่", points: 400, emoji: "🍕" },
    { id: "starbucks", name: "สตาร์บัคส์หวานเจี๊ยบ", points: 120, emoji: "☕" }
  ];

  const allRewards = [...defaultRewards, ...customRewards];

  const handleRedeem = (reward: Reward) => {
    if (points < reward.points) return;
    const success = redeemReward(reward);
    if (success) {
      setRedeemedToast({ show: true, name: reward.name, emoji: reward.emoji });
      setTimeout(() => setRedeemedToast(null), 3000);
    }
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim()) return;
    addCustomReward(newRewardName, newRewardPoints, newRewardEmoji);
    setNewRewardName("");
    setNewRewardPoints(200);
    setNewRewardEmoji("🍲");
    setShowAddReward(false);
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

  const formatDateThai = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
      weekday: "short"
    });
  };

  const getDayColor = (dateStr: string) => {
    const day = history[dateStr];
    if (!day) return "bg-muted text-muted-foreground/60 hover:ring-1 hover:ring-muted-foreground/30";
    const count = (day.gym ? 1 : 0) + (day.walk ? 1 : 0) + (day.steps10k ? 1 : 0);
    if (count >= 2) {
      return "bg-success text-white shadow-[0_0_8px_rgba(34,197,94,0.3)] hover:scale-110";
    }
    if (count === 1) {
      return "bg-success/50 text-white hover:scale-110";
    }
    return "bg-muted text-muted-foreground/60 hover:ring-1 hover:ring-muted-foreground/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 pb-12 relative"
    >
      {/* Toast Notification for Reward Redemption */}
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

      {/* Top Header */}
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

      {/* Points card relocated below */}

      {/* Riko's Motivation Card */}
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

      {/* Weekly Gym Schedule Card */}
      <section className="bg-card p-6 rounded-2xl border border-border space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-foreground text-lg tracking-tight">
              ตารางออกกำลังกายประจำสัปดาห์
            </h4>
            <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
              Weekly Gym Routine
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {[
            { day: "จันทร์", label: "จ.", routine: "อก + หลังแขน 🏋️", index: 1 },
            { day: "อังคาร", label: "อ.", routine: "หลัง + หน้าแขน 💪", index: 2 },
            { day: "พุธ", label: "พ.", routine: "พัก หรือ เดิน 10,000 ก้าว 👟", index: 3 },
            { day: "พฤหัสบดี", label: "พฤ.", routine: "ไหล่ + ขา 🦵", index: 4 },
            { day: "ศุกร์", label: "ศ.", routine: "อก + หลัง 🔥", index: 5 },
            { day: "เสาร์", label: "ส.", routine: "เก็บตก หรือ เดิน 10,000 ก้าว 🚶", index: 6 },
            { day: "อาทิตย์", label: "อา.", routine: "พักผ่อนเต็มที่ 😴", index: 0 },
          ].map((item) => {
            const isToday = new Date().getDay() === item.index;
            return (
              <motion.div
                key={item.day}
                whileHover={{ scale: 1.01, x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                  isToday
                    ? "bg-primary/15 border-primary/40 shadow-[0_0_12px_rgba(152,16,250,0.15)]"
                    : "bg-background/40 border-border/60 hover:bg-background/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0",
                      isToday
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "font-bold text-sm",
                      isToday ? "text-foreground font-black" : "text-muted-foreground"
                    )}
                  >
                    {item.day}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold text-right",
                    isToday ? "text-secondary font-black" : "text-foreground/90"
                  )}
                >
                  {item.routine}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* GitHub Commit Style Contribution Grid */}
      <section className="bg-card p-5 rounded-2xl border border-border space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="px-1">
          <h4 className="font-black text-foreground text-lg tracking-tight">
            Workout Heatmap
          </h4>
        </div>

        {/* Grid Container with weekday labels on top */}
        <div className="pt-2">
          <div className="grid grid-cols-7 gap-2 w-full select-none cursor-pointer">
            {/* Weekday labels on top */}
            <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">อา.</span>
            <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">จ.</span>
            <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">อ.</span>
            <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">พ.</span>
            <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">พฤ.</span>
            <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">ศ.</span>
            <span className="text-center text-[10px] font-black text-muted-foreground/50 py-1">ส.</span>

            {/* Grid days */}
            {gridDays.map((day) => {
              const dateStr = formatLocalDate(day);
              const isSelected = dateStr === selectedDateStr;
              const isFuture = dateStr > todayStr;
              const isToday = dateStr === todayStr;

              return (
                <motion.button
                  key={dateStr}
                  disabled={isFuture}
                  whileHover={!isFuture ? { scale: 1.1, zIndex: 10 } : {}}
                  whileTap={!isFuture ? { scale: 0.9 } : {}}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={cn(
                    "w-full aspect-square rounded-lg transition-all duration-200 relative text-xs sm:text-sm font-black flex items-center justify-center",
                    getDayColor(dateStr),
                    isToday && !isSelected && "border border-primary/50",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10",
                    isFuture && "opacity-20 cursor-not-allowed text-muted-foreground/20"
                  )}
                  title={`${formatDateThai(dateStr)}: ${
                    history[dateStr]?.gym ? "Gym " : ""
                  }${history[dateStr]?.walk ? "Walk" : "No Workout"}`}
                >
                  {day.getDate()}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[10px] text-muted-foreground px-1 border-t border-border pt-3">
          <span>{formatDateThai(selectedDateStr)}</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-4 h-4 rounded bg-muted" />
            <div className="w-4 h-4 rounded bg-success/50" />
            <div className="w-4 h-4 rounded bg-success" />
            <span>More</span>
          </div>
        </div>
      </section>

      {/* Log Workout (Check-in) Card */}
      <section className="bg-card p-6 rounded-2xl border border-border space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success/15 rounded-xl flex items-center justify-center text-success">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-foreground text-lg tracking-tight">
              เช็คอินออกกำลังกาย
            </h4>
            <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
              {formatDateThai(selectedDateStr)} {selectedDateStr === todayStr && "(วันนี้)"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Gym Check-in Button */}
          <motion.button
            whileHover={selectedDateStr === todayStr ? { scale: 1.02 } : {}}
            whileTap={selectedDateStr === todayStr ? { scale: 0.98 } : {}}
            disabled={selectedDateStr !== todayStr}
            onClick={() => toggleGym(selectedDateStr)}
            className={cn(
              "p-3.5 rounded-xl border text-left flex flex-col justify-between h-[6.5rem] transition-all duration-300 w-full col-span-1",
              activeWorkoutDay.gym
                ? "bg-success text-white border-transparent shadow-[0_8px_16px_rgba(34,197,94,0.15)]"
                : "bg-muted text-foreground border-border",
              selectedDateStr === todayStr && "hover:bg-muted/80",
              selectedDateStr !== todayStr && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-2xl">🏋️</span>
              {activeWorkoutDay.gym ? (
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-success shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                selectedDateStr === todayStr && (
                  <span className="text-[9px] font-black text-success uppercase tracking-widest bg-success/15 px-1.5 py-0.5 rounded">
                    +100 pts
                  </span>
                )
              )}
            </div>
            <div>
              <p className={cn("font-black text-xs sm:text-sm italic leading-none", activeWorkoutDay.gym ? "text-white" : "text-foreground")}>
                เข้ายิม (Gym)
              </p>
              <p className={cn("text-[8px] font-black tracking-widest uppercase mt-1", activeWorkoutDay.gym ? "text-white/80" : "text-muted-foreground")}>
                {selectedDateStr > todayStr 
                  ? "Future Date" 
                  : selectedDateStr < todayStr 
                    ? (activeWorkoutDay.gym ? "Completed!" : "No Record") 
                    : (activeWorkoutDay.gym ? "Completed!" : "Check-in")}
              </p>
            </div>
          </motion.button>

          {/* Incline Walk Check-in Button */}
          <motion.button
            whileHover={selectedDateStr === todayStr ? { scale: 1.02 } : {}}
            whileTap={selectedDateStr === todayStr ? { scale: 0.98 } : {}}
            disabled={selectedDateStr !== todayStr}
            onClick={() => toggleWalk(selectedDateStr)}
            className={cn(
              "p-3.5 rounded-xl border text-left flex flex-col justify-between h-[6.5rem] transition-all duration-300 w-full col-span-1",
              activeWorkoutDay.walk
                ? "bg-success text-white border-transparent shadow-[0_8px_16px_rgba(34,197,94,0.15)]"
                : "bg-muted text-foreground border-border",
              selectedDateStr === todayStr && "hover:bg-muted/80",
              selectedDateStr !== todayStr && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-2xl">⛰️</span>
              {activeWorkoutDay.walk ? (
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-success shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                selectedDateStr === todayStr && (
                  <span className="text-[9px] font-black text-success uppercase tracking-widest bg-success/15 px-1.5 py-0.5 rounded">
                    +50 pts
                  </span>
                )
              )}
            </div>
            <div>
              <p className={cn("font-black text-xs sm:text-sm italic leading-none", activeWorkoutDay.walk ? "text-white" : "text-foreground")}>
                เดินชัน (Walk)
              </p>
              <p className={cn("text-[8px] font-black tracking-widest uppercase mt-1", activeWorkoutDay.walk ? "text-white/80" : "text-muted-foreground")}>
                {selectedDateStr > todayStr 
                  ? "Future Date" 
                  : selectedDateStr < todayStr 
                    ? (activeWorkoutDay.walk ? "Completed!" : "No Record") 
                    : (activeWorkoutDay.walk ? "Completed!" : "Check-in")}
              </p>
            </div>
          </motion.button>

          {/* Steps 10k Check-in Button */}
          <motion.button
            whileHover={selectedDateStr === todayStr ? { scale: 1.02 } : {}}
            whileTap={selectedDateStr === todayStr ? { scale: 0.98 } : {}}
            disabled={selectedDateStr !== todayStr}
            onClick={() => toggleSteps10k(selectedDateStr)}
            className={cn(
              "p-3.5 rounded-xl border text-left flex flex-col justify-between h-[6.5rem] transition-all duration-300 w-full col-span-2 sm:col-span-1",
              activeWorkoutDay.steps10k
                ? "bg-success text-white border-transparent shadow-[0_8px_16px_rgba(34,197,94,0.15)]"
                : "bg-muted text-foreground border-border",
              selectedDateStr === todayStr && "hover:bg-muted/80",
              selectedDateStr !== todayStr && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-2xl">👟</span>
              {activeWorkoutDay.steps10k ? (
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-success shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                selectedDateStr === todayStr && (
                  <span className="text-[9px] font-black text-success uppercase tracking-widest bg-success/15 px-1.5 py-0.5 rounded">
                    +50 pts
                  </span>
                )
              )}
            </div>
            <div>
              <p className={cn("font-black text-xs sm:text-sm italic leading-none", activeWorkoutDay.steps10k ? "text-white" : "text-foreground")}>
                เดิน 10,000 ก้าว
              </p>
              <p className={cn("text-[8px] font-black tracking-widest uppercase mt-1", activeWorkoutDay.steps10k ? "text-white/80" : "text-muted-foreground")}>
                {selectedDateStr > todayStr 
                  ? "Future Date" 
                  : selectedDateStr < todayStr 
                    ? (activeWorkoutDay.steps10k ? "Completed!" : "No Record") 
                    : (activeWorkoutDay.steps10k ? "Completed!" : "Check-in")}
              </p>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Points & Level Hero Card */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-primary/10 rounded-2xl blur-3xl transition-all duration-700"></div>
        <div 
          onClick={() => setShowRankDetails(!showRankDetails)}
          className="bg-card rounded-2xl p-6 text-foreground relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] border border-border overflow-hidden cursor-pointer hover:border-primary/40 transition-colors select-none"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-[0.3em] text-secondary uppercase">
                POINTS BALANCE
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Coins className="w-8 h-8 text-gold fill-gold animate-pulse shrink-0" />
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-white leading-none pr-3">
                  {points.toLocaleString()}
                </h3>
                <span className="text-muted-foreground text-xs font-black uppercase tracking-widest italic self-end pb-0.5">PTS</span>
              </div>
            </div>
            <div className="sm:text-right border-t border-border/50 sm:border-none pt-3 sm:pt-0">
              <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase flex items-center sm:justify-end gap-1.5">
                RANK <span className="text-secondary text-[9px] bg-secondary/15 px-1.5 py-0.5 rounded font-bold">INFO ℹ️</span>
              </span>
              <p className="font-black text-xl italic text-secondary">
                {points >= 12000 ? "Gym Lord 👑" : points >= 6000 ? "Pro Lifter ⚡" : points >= 3000 ? "Iron Lifter 🏋️" : points >= 1000 ? "Active Walker 👟" : "Rookie 🌱"}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {showRankDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-border/50 mt-4 pt-4 space-y-3 overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                    Rank Progression
                  </p>
                  <p className="text-[9px] font-bold text-secondary">
                    เป้าหมายแต้มสะสม
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Rookie 🌱", target: 0, desc: "เริ่มต้นก้าวแรกแห่งการฟิตร่างกาย (สัปดาห์แรก)" },
                    { name: "Active Walker 👟", target: 1000, desc: "เดินชันและขยับตัวต่อเนื่อง (สะสมแต้ม 2-3 สัปดาห์)" },
                    { name: "Iron Lifter 🏋️", target: 3000, desc: "เข้ายิมยกเหล็กสร้างกล้ามเนื้อจริงจัง (สะสมแต้ม 1-2 เดือน)" },
                    { name: "Pro Lifter ⚡", target: 6000, desc: "วินัยดีเลิศ ร่างกายเริ่มเปลี่ยนแปลงชัดเจน (สะสมแต้ม 3 เดือน)" },
                    { name: "Gym Lord 👑", target: 12000, desc: "ราชาฟิตเนสผู้ครองวินัยเหล็กและครอบครองหุ่นในฝัน (สะสมแต้ม 6 เดือนขึ้นไป)" }
                  ].map((r) => {
                    const currentRank = points >= 12000 ? "Gym Lord 👑" : points >= 6000 ? "Pro Lifter ⚡" : points >= 3000 ? "Iron Lifter 🏋️" : points >= 1000 ? "Active Walker 👟" : "Rookie 🌱";
                    const isCurrent = currentRank === r.name;
                    const isUnlocked = points >= r.target;
                    return (
                      <div
                        key={r.name}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors",
                          isCurrent
                            ? "bg-primary/15 border-primary/40 text-foreground"
                            : isUnlocked
                              ? "bg-muted/30 border-border/40 text-muted-foreground"
                              : "bg-background/40 border-border/20 text-muted-foreground/50"
                        )}
                      >
                        <div>
                          <p className={cn("font-black", isCurrent ? "text-secondary" : "text-foreground")}>
                            {r.name} {isCurrent && " (แรงค์ปัจจุบัน)"}
                          </p>
                          <p className="text-[9px] text-muted-foreground/80 mt-0.5">{r.desc}</p>
                        </div>
                        <span className="font-black text-right shrink-0">
                          {r.target === 0 ? "เริ่มต้น" : `>= ${r.target} PTS`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rewards Shop Section */}
      <section className="space-y-5">
        <div className="flex justify-between items-end px-1">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter italic uppercase">
              Reward Shop
            </h3>
            <p className="text-muted-foreground font-black text-[9px] tracking-[0.2em] uppercase">
              สะสมแต้มไว้แลกของอร่อย
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddReward(!showAddReward)}
            className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Reward
          </motion.button>
        </div>

        {/* Custom Reward Creation Form */}
        <AnimatePresence>
          {showAddReward && (
            <motion.form
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleCreateReward}
              className="bg-card p-6 rounded-2xl border border-border space-y-4"
            >
              <h4 className="font-black text-foreground text-base">สร้างรางวัลใหม่ส่วนตัว</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground block mb-1">ชื่อของรางวัล</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ชาบูลุยเดี่ยว, โดนัท 2 ชิ้น"
                    value={newRewardName}
                    onChange={(e) => setNewRewardName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground block mb-1">แต้มที่ต้องใช้</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newRewardPoints}
                      onChange={(e) => setNewRewardPoints(parseInt(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground block mb-1">เลือกอิโมจิ</label>
                    <select
                      value={newRewardEmoji}
                      onChange={(e) => setNewRewardEmoji(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      <option value="🍲">🍲 ชาบู</option>
                      <option value="🧋">🧋 ชานม</option>
                      <option value="🍧">🍧 บิงซู</option>
                      <option value="🥩">🥩 หมูกระทะ</option>
                      <option value="🍕">🍕 พิซซ่า</option>
                      <option value="☕">☕ กาแฟ/คาเฟ่</option>
                      <option value="🍰">🍰 เค้ก/ของหวาน</option>
                      <option value="🍺">🍺 เบียร์/ปาร์ตี้</option>
                      <option value="🛍️">🛍️ ช้อปปิ้ง</option>
                      <option value="🎮">🎮 เกม</option>
                      <option value="😴">😴 นอนเล่น</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddReward(false)}
                  className="px-4 py-2 text-muted-foreground font-bold text-xs uppercase tracking-widest"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/95"
                >
                  บันทึกรางวัล
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {allRewards.map((reward) => {
            const canAfford = points >= reward.points;

            return (
              <div
                key={reward.id}
                className="bg-card p-4 sm:p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl relative shadow-inner">
                    {reward.emoji}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-base leading-none mb-1">
                      {reward.name}
                    </h4>
                    <p className="text-[10px] font-black text-muted-foreground tracking-wider uppercase">
                      ต้องการ {reward.points} PTS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {reward.isCustom && (
                    <button
                      onClick={() => deleteCustomReward(reward.id)}
                      className="text-muted-foreground hover:text-destructive p-2 transition-colors"
                      title="ลบรางวัล"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    disabled={!canAfford}
                    onClick={() => handleRedeem(reward)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all tap-effect",
                      canAfford
                        ? "bg-gold hover:bg-gold/90 text-zinc-950 shadow-[0_4px_12px_rgba(250,204,21,0.25)] hover:scale-[1.02]"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    แลกแต้ม
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Redeemed History Section */}
      {redeemedHistory.length > 0 && (
        <section className="space-y-4">
          <h4 className="font-black text-foreground text-lg tracking-tight px-1">
            ประวัติการแลกรางวัล
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {redeemedHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card px-4 py-3 rounded-xl flex items-center justify-between border border-border"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{item.emoji}</span>
                  <div>
                    <p className="font-black text-xs text-foreground leading-none mb-0.5">
                      {item.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                      {new Date(item.redeemedAt).toLocaleDateString("th-TH")} •{" "}
                      {new Date(item.redeemedAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black italic text-destructive">
                  -{item.points} PTS
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Secondary Feature: Diet Diary Card */}
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

      {/* Coach Riko Chat Modal Overlay */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            {/* Backdrop Click to Close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowChat(false)}
            />

            {/* Chat Container Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-[80vh] bg-card rounded-t-[2.5rem] border-t border-border shadow-[0_-16px_48px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/20 bg-background/50 shadow-md">
                    <img src={rikoImg} alt="Riko" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <h5 className="font-black text-foreground text-sm flex items-center gap-1.5 leading-none mb-1">
                      Coach Riko 🎀
                    </h5>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Online / คุยกับริโกะ</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm("คุณต้องการล้างประวัติการแชททั้งหมดใช่หรือไม่?")) {
                        const username = getUserName();
                        const randomGreeting = getRandomGreeting(username);
                        clearChatHistory(randomGreeting);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors tap-effect"
                    title="ล้างประวัติการแชท"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowChat(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages scroll area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {chatHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={cn(
                      "flex gap-2.5 max-w-[85%]",
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {msg.sender === "riko" && (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 bg-background shrink-0 mt-0.5 shadow-sm">
                        <img src={rikoImg} alt="Riko" className="w-full h-full object-cover object-top" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed",
                        msg.sender === "user"
                          ? "bg-secondary text-white rounded-tr-none shadow-[0_4px_12px_rgba(192,132,252,0.15)]"
                          : "bg-muted text-foreground rounded-tl-none"
                      )}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex gap-2.5 max-w-[85%] mr-auto items-center"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 bg-background shrink-0 shadow-sm">
                      <img src={rikoImg} alt="Riko" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="px-4 py-2.5 bg-muted text-muted-foreground rounded-2xl rounded-tl-none text-xs font-bold flex items-center gap-1.5">
                      ริโกะกำลังคิด
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce delay-100"></span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce delay-200"></span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce delay-300"></span>
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-6 py-2.5 overflow-x-auto no-scrollbar flex gap-2 border-t border-border/40 bg-card select-none">
                {[
                  "💡 วันนี้กินอะไรดีน้า?",
                  "💡 ขอกำลังใจออกกำลังกายหน่อย!",
                  "💡 วันนี้กินชานมไข่มุกมา แก้ไงดี?",
                  "💡 แนะนำท่าลดหน้าท้องหน่อย"
                ].map((chip) => (
                  <button
                    key={chip}
                    disabled={chatLoading}
                    onClick={() => handleSendMessage(chip.replace("💡 ", ""))}
                    className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-[10px] font-black text-muted-foreground hover:text-foreground rounded-full border border-border/50 shrink-0 transition-colors tap-effect"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="px-6 pb-8 pt-3 border-t border-border bg-card flex gap-2 items-center"
              >
                <input
                  type="text"
                  disabled={chatLoading}
                  placeholder="คุยอะไรกับริโกะดีน้า..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-background border border-border text-foreground px-4 py-2.5 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="w-9 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all tap-effect shrink-0 shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4 fill-primary-foreground stroke-none" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
