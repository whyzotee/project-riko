import { supabase } from "./supabase";
import type { WorkoutDay } from "../store/useGamifyStore";

interface Log {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
}

interface RikoReplyConfig {
  chatHistory: Array<{ sender: "user" | "riko"; text: string }>;
  messageText: string;
  userName: string;
  tdee: number;
  logs: Log[];
  history: Record<string, WorkoutDay>;
  points: number;
  streak: number;
}

export const getRikoReply = async ({
  chatHistory,
  messageText,
  userName,
  tdee,
  logs,
  history,
  points,
  streak,
}: RikoReplyConfig): Promise<string> => {
  const formattedHistory = [
    ...chatHistory.map(msg => ({
      role: msg.sender === "user" ? ("user" as const) : ("model" as const),
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

  const todayStr = new Date().toLocaleDateString("en-CA");
  const todayWorkout = history[todayStr];
  const consumedCalories = logs.reduce((sum, log) => sum + Number(log.calories), 0);
  const totalProtein = logs.reduce((sum, log) => sum + Number(log.protein || 0), 0);
  const totalFat = logs.reduce((sum, log) => sum + Number(log.fat || 0), 0);
  const totalCarbs = logs.reduce((sum, log) => sum + Number(log.carbs || 0), 0);

  const workoutInfo = `ข้อมูลผู้ใช้วันนี้:
- ชื่อผู้ใช้งาน: ${userName} (กรุณาทักทายและเรียกผู้ใช้ด้วยชื่อนี้ เพื่อความเป็นกันเองและความสนิทสนม)
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

  let responseData: { text?: string } | null = null;
  let invokeError: { status?: number; message?: string } | null = null;

  try {
    const { data, error } = await supabase.functions.invoke("chat-riko", {
      body: { contents: formattedHistory, workoutInfo: workoutInfo }
    });
    responseData = data;
    invokeError = error;
  } catch (invokeErr: unknown) {
    if (invokeErr && typeof invokeErr === "object") {
      invokeError = invokeErr as { status?: number; message?: string };
    } else {
      invokeError = { message: String(invokeErr) };
    }
  }

  const fallbackModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemma-4-26b-it"];

  const statusIs429 = invokeError && (
    invokeError.status === 429 || (invokeError.message && invokeError.message.includes("429"))
  );

  if (statusIs429) {
    console.warn("Primary Supabase Edge Function hit quota (429). Retrying with fallback models...");
    for (const model of fallbackModels) {
      try {
        console.info(`Retrying Supabase invoke with model: ${model}`);
        const retryResult = await supabase.functions.invoke("chat-riko", {
          body: { contents: formattedHistory, workoutInfo: workoutInfo, model: model }
        });

        if (!retryResult.error && retryResult.data && retryResult.data.text) {
          responseData = retryResult.data;
          invokeError = null;
          break;
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
      const clientModels = ["gemini-3.1-flash-lite-preview", ...fallbackModels];

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
                parts: [{ text: `คุณคือ Coach Riko (โค้ชริโกะ) โค้ชผู้ช่วยฟิตเนสสาวสุดน่ารัก กระตือรือร้น ชอบส่งพลังบวก พูดภาษาไทยอย่างเป็นกันเอง ลงท้ายด้วยคำว่า 'ค่ะ', 'นะคะ', 'น้า' เสมอ และใช้อิโมจิน่ารักๆ ตอบเรื่องสุขภาพ ฟิตเนส แคลอรี่ และการกิน และเรียกผู้ใช้ด้วยชื่อคุณ ${userName} ตลอดเพื่อความสนิทสนม ข้อมูลผู้ใช้วันนี้: ${workoutInfo}` }]
              }
            })
          });

          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            return fallbackResult.candidates[0].content.parts[0].text as string;
          } else {
            console.warn(`Client fallback model ${model} failed with status: ${fallbackResponse.status}`);
          }
        } catch (fallbackErr) {
          console.error(`Client fallback model ${model} threw error:`, fallbackErr);
        }
      }
    }

    const lowerText = messageText.toLowerCase();
    if (lowerText.includes("กิน") || lowerText.includes("อาหาร") || lowerText.includes("เมนู")) {
      return "ช่วงนี้ถ้ากลัวหลุด ลองทานเป็นอกไก่ย่างถ่าน ผัดกะเพราอกไก่น้ำมันน้อย หรือสุกี้น้ำอกไก่ดีไหมคะ? 🥗 ซดซุปร้อนๆ ชื่นใจ และโปรตีนเน้นๆ เลยค่ะ! ส่วนถ้าอยากชานมไข่มุก วันนี้ริโกะอนุญาตให้กินหวานน้อย (25%) เป็นรางวัลตัวเองนะคะคนเก่ง! 🧋✨";
    } else if (lowerText.includes("ออกกำลัง") || lowerText.includes("ยิม") || lowerText.includes("เหนื่อย")) {
      return "วันนี้ออกกำลังกายสุดยอดไปเลยน้า! โค้ชริโกะภูมิใจในตัวคุณมากเลยค่ะ อย่าลืมดื่มน้ำเยอะๆ และยืดกล้ามเนื้อ (Stretching) ด้วยนะคะ กล้ามเนื้อจะได้ฟื้นฟูไวๆ และสะสมพลังไว้ลุยวันต่อไปกัน! 🏋️💪💖";
    } else {
      return "ริโกะอยากบอกว่าคุณเก่งมากๆ เลยนะคะที่พยายามรักษาสุขภาพอย่างต่อเนื่องในแอป Project Riko! 🎀 วันนี้มาฟิตร่างกาย สะสมคะแนนไปแลกของอร่อยๆ ทานกันนะคะ ริโกะจะอยู่เคียงข้างคอยเชียร์และเป็นกำลังใจให้เสมอเลยน้า! 🥺💖";
    }
  }

  return responseData.text;
};
