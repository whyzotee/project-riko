import { supabase } from "./supabase";
import type { Meal, DailyMealPlan } from "../store/useMealPlanStore";

export const FALLBACK_MEALS: Record<Meal["type"], Meal[]> = {
  breakfast: [
    { type: "breakfast", name: "อกไก่นุ่มกระเทียมพริกไทย + ไข่ต้ม 2 ฟอง", calories: 270, protein: 32, fat: 10, carbs: 2, location: "7-Eleven" },
    { type: "breakfast", name: "แซนด์วิชกระเป๋าอกไก่หยอง + นมโปรตีนสูงรสจืด", calories: 340, protein: 33, fat: 6, carbs: 38, location: "7-Eleven" },
    { type: "breakfast", name: "ข้าวกล้องราดแกงอกไก่ผัดขิง + ไข่ต้ม", calories: 340, protein: 26, fat: 8, carbs: 40, location: "ร้านข้าวแกง" },
    { type: "breakfast", name: "ข้าวต้มอกไก่สับใส่ไข่", calories: 290, protein: 20, fat: 7, carbs: 36, location: "ตามสั่ง" },
  ],
  lunch: [
    { type: "lunch", name: "ข้าวกะเพราอกไก่ชิ้น (น้ำมันน้อย) + ไข่ดาว", calories: 460, protein: 34, fat: 12, carbs: 52, location: "ตามสั่ง" },
    { type: "lunch", name: "เส้นหมี่น้ำใสอกไก่ฉีกใส่ผักเยอะๆ", calories: 310, protein: 22, fat: 4, carbs: 45, location: "ร้านก๋วยเตี๋ยว" },
    { type: "lunch", name: "ข้าวกล้องราดแกงส้มผักรวม + ปลานึ่ง", calories: 320, protein: 24, fat: 6, carbs: 42, location: "ร้านข้าวแกง" },
    { type: "lunch", name: "เกาเหลาลูกชิ้นปลาต้มยำมะนาว (ไม่เจียว) + ข้าวสวยครึ่งทัพพี", calories: 280, protein: 20, fat: 6, carbs: 35, location: "ร้านก๋วยเตี๋ยว" },
  ],
  dinner: [
    { type: "dinner", name: "สุกี้น้ำอกไก่เน้นผักและไข่", calories: 330, protein: 28, fat: 7, carbs: 38, location: "ตามสั่ง" },
    { type: "dinner", name: "แกงจืดเต้าหู้หมูสับสาหร่าย + ข้าวสวยครึ่งทัพพี", calories: 260, protein: 19, fat: 9, carbs: 26, location: "ร้านข้าวแกง" },
    { type: "dinner", name: "เกาเหลาไก่ฉีกน้ำใสใส่ผักบุ้ง/ถั่วงอกเยอะๆ", calories: 210, protein: 22, fat: 4, carbs: 15, location: "ร้านก๋วยเตี๋ยว" },
    { type: "dinner", name: "สลัดทูน่าในน้ำแร่ + อกไก่นุ่มพริกไทยดำ", calories: 230, protein: 32, fat: 4, carbs: 16, location: "7-Eleven" },
  ],
  snack: [
    { type: "snack", name: "นม Meiji High Protein รสจืด/หวานน้อย", calories: 170, protein: 28, fat: 2, carbs: 10, location: "7-Eleven" },
    { type: "snack", name: "ถั่วแระญี่ปุ่นต้มแกะเปลือก", calories: 110, protein: 9, fat: 3, carbs: 12, location: "7-Eleven" },
    { type: "snack", name: "ถั่วอัลมอนด์อบธรรมชาติ 1 ซองเล็ก", calories: 160, protein: 6, fat: 14, carbs: 5, location: "7-Eleven" },
    { type: "snack", name: "โยเกิร์ตไขมันต่ำ 0% รสธรรมชาติ + กล้วยหอม", calories: 160, protein: 7, fat: 0, carbs: 33, location: "7-Eleven" },
  ],
};

export const getRandomMealPlan = (dateStr: string): DailyMealPlan => {
  const selectRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    date: dateStr,
    meals: [
      selectRandom(FALLBACK_MEALS.breakfast),
      selectRandom(FALLBACK_MEALS.lunch),
      selectRandom(FALLBACK_MEALS.dinner),
      selectRandom(FALLBACK_MEALS.snack),
    ],
    rikoComment: "นี่คือเมนูทางเลือกอร่อยๆ ที่หาทานได้ง่าย (มีทั้งข้าวแกง ก๋วยเตี๋ยว อาหารตามสั่ง หรือ 7-11) ที่ริโกะสุ่มจัดมาให้คนเก่งแล้วนะคะ! 🥗✨",
  };
};

export const getRandomMeal = (type: Meal["type"], excludeName?: string): Meal => {
  const options = FALLBACK_MEALS[type].filter((m) => m.name !== excludeName);
  const pool = options.length > 0 ? options : FALLBACK_MEALS[type];
  return pool[Math.floor(Math.random() * pool.length)];
};

// Client fallback fetch helper in case Supabase Edge Function is down
const clientGeminiFallback = async (prompt: string): Promise<string> => {
  const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!clientApiKey) throw new Error("Client API Key not available");

  const fallbackModels = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
  for (const model of fallbackModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientApiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
      if (response.ok) {
        const result = await response.json();
        return result.candidates[0].content.parts[0].text as string;
      }
    } catch (e) {
      console.warn(`Client fallback model ${model} error:`, e);
    }
  }
  throw new Error("Client API fallback failed");
};

export const generateMealPlanFromAPI = async (dateStr: string, userName: string, tdee: number): Promise<DailyMealPlan> => {
  try {
    // 1. Call recommend-meals Edge Function
    const { data, error } = await supabase.functions.invoke("recommend-meals", {
      body: { date: dateStr, userName, tdee }
    });

    if (!error && data && data.meals && data.meals.length === 4) {
      return {
        date: dateStr,
        meals: data.meals,
        rikoComment: data.rikoComment || "ริโกะคัดเลือกตารางอาหารสุขภาพที่มีทั้งข้าวแกง ก๋วยเตี๋ยว อาหารตามสั่ง และเซเว่นมาให้แล้วน้าคนเก่ง! 🎀"
      };
    }

    if (error) {
      console.warn("recommend-meals edge function error, trying client-side fallback:", error);
    }
  } catch (err) {
    console.warn("recommend-meals edge function exception:", err);
  }

  // 2. Client fallback
  try {
    const prompt = `จัดตารางอาหาร 4 มื้อ (breakfast, lunch, dinner, snack) ประจำวันที่ ${dateStr} สำหรับคุณ ${userName}
ข้อกำหนดอาหาร:
- ต้องเป็นอาหารที่หาทานได้ง่ายในไทย เช่น ร้านอาหารตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยว, หรือ 7-Eleven
- มีสารอาหารครบถ้วน (โปรตีนสูง คาร์บพอดี ไขมันต่ำ)
- แคลอรีรวมทั้งหมดของทั้ง 4 มื้อควรใกล้เคียงเป้าหมายประจำวันคือ ${tdee} kcal (+/- 100 kcal)
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามโครงสร้างตัวอย่างนี้เท่านั้น:
{
  "rikoComment": "ริโกะเขียนทักทายคนเก่งอย่างน่ารักสดใสค่ะ โดยจัดพลังงานรวมให้อยู่ราวๆ ${tdee} kcal ค่ะ 🎀🥗",
  "meals": [
    { "type": "breakfast", "name": "ชื่ออาหารเช้า", "calories": 250, "protein": 18, "fat": 6, "carbs": 30, "location": "ร้านข้าวแกง" },
    { "type": "lunch", "name": "ชื่ออาหารกลางวัน", "calories": 450, "protein": 28, "fat": 12, "carbs": 55, "location": "ร้านก๋วยเตี๋ยว" },
    { "type": "dinner", "name": "ชื่ออาหารเย็น", "calories": 320, "protein": 24, "fat": 8, "carbs": 35, "location": "ตามสั่ง" },
    { "type": "snack", "name": "ชื่อของว่าง", "calories": 150, "protein": 20, "fat": 2, "carbs": 10, "location": "7-Eleven" }
  ]
}`;
    const text = await clientGeminiFallback(prompt);
    const parsed = JSON.parse(text);
    if (parsed && parsed.meals && parsed.meals.length === 4) {
      return {
        date: dateStr,
        meals: parsed.meals,
        rikoComment: parsed.rikoComment || "ริโกะจัดตารางอาหารเพื่อสุขภาพมาให้แล้วนะคะคนเก่ง! 🎀✨"
      };
    }
  } catch (err) {
    console.warn("Client fallback failed, using local randomize:", err);
  }

  // 3. Local fallback
  return getRandomMealPlan(dateStr);
};

export const generateSingleMealFromAPI = async (
  dateStr: string,
  mealType: Meal["type"],
  oldMealName: string,
  userName: string,
  tdee: number
): Promise<Meal> => {
  try {
    // 1. Call recommend-meals Edge Function
    const { data, error } = await supabase.functions.invoke("recommend-meals", {
      body: { date: dateStr, userName, mealType, excludeMealName: oldMealName, tdee }
    });

    if (!error && data && data.name && data.calories > 0) {
      return data as Meal;
    }

    if (error) {
      console.warn("recommend-meals edge function single meal error, trying client-side fallback:", error);
    }
  } catch (err) {
    console.warn("recommend-meals edge function single meal exception:", err);
  }

  // 2. Client fallback
  try {
    const prompt = `แนะนำอาหารมื้อ "${mealType}" ใหม่แทนที่ "${oldMealName}" สำหรับคุณ ${userName} ในวันที่ ${dateStr}
ข้อกำหนดอาหาร:
- หาซื้อได้ง่ายในไทย เช่น ร้านตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยว, หรือ 7-Eleven
- มีโปรตีนสูง ดีต่อสุขภาพ และไม่ซ้ำกับ "${oldMealName}"
- คำนวณปริมาณพลังงานของมื้อนี้ให้สอดคล้องกับเป้าหมายแคลอรีรวมทั้งวันคือ ${tdee} kcal
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามโครงสร้างตัวอย่างนี้เท่านั้น:
{
  "type": "${mealType}",
  "name": "ชื่ออาหารใหม่",
  "calories": 250,
  "protein": 20,
  "fat": 6,
  "carbs": 32,
  "location": "ร้านก๋วยเตี๋ยว"
}`;
    const text = await clientGeminiFallback(prompt);
    const parsed = JSON.parse(text);
    if (parsed && parsed.name && parsed.calories > 0) {
      return parsed as Meal;
    }
  } catch (err) {
    console.warn("Client fallback single meal failed, using local randomize:", err);
  }

  // 3. Local fallback
  return getRandomMeal(mealType, oldMealName);
};
