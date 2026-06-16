import { supabase } from "./supabase";
import type { Meal, DailyMealPlan } from "../store/useMealPlanStore";
import { FALLBACK_MEALS } from "./mealPlannerFallbackData";

export { FALLBACK_MEALS };

export const getRandomMealPlan = (dateStr: string, tdee: number): DailyMealPlan => {
  const selectRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const baseMeals = [
    { ...selectRandom(FALLBACK_MEALS.breakfast) },
    { ...selectRandom(FALLBACK_MEALS.lunch) },
    { ...selectRandom(FALLBACK_MEALS.dinner) },
    { ...selectRandom(FALLBACK_MEALS.snack) },
  ];

  const baseTotalCalories = baseMeals.reduce((sum, m) => sum + m.calories, 0);
  const ratio = tdee / baseTotalCalories;

  const scaledMeals = baseMeals.map((meal) => {
    const scaled = { ...meal };
    if (ratio >= 1.5) {
      if (meal.type !== "snack") {
        scaled.name = `${meal.name} (สั่งพิเศษ/เบิ้ลโปรตีน + ไข่ต้ม)`;
        scaled.calories = Math.round(meal.calories * 1.65);
        scaled.protein = Math.round(meal.protein * 1.7);
        scaled.carbs = Math.round(meal.carbs * 1.6);
        scaled.fat = Math.round(meal.fat * 1.4);
      } else {
        scaled.name = `${meal.name} (สั่งเบิ้ล/คูณสอง)`;
        scaled.calories = Math.round(meal.calories * 2);
        scaled.protein = Math.round(meal.protein * 2);
        scaled.carbs = Math.round(meal.carbs * 2);
        scaled.fat = Math.round(meal.fat * 2);
      }
    } else if (ratio >= 1.2) {
      if (meal.type !== "snack") {
        scaled.name = `${meal.name} (สั่งแบบพิเศษ/เพิ่มเนื้อสัตว์)`;
        scaled.calories = Math.round(meal.calories * 1.3);
        scaled.protein = Math.round(meal.protein * 1.35);
        scaled.carbs = Math.round(meal.carbs * 1.25);
        scaled.fat = Math.round(meal.fat * 1.2);
      } else {
        scaled.name = `${meal.name} (ทานคู่กับไข่ต้ม)`;
        scaled.calories = Math.round(meal.calories + 75);
        scaled.protein = Math.round(meal.protein + 6);
        scaled.fat = Math.round(meal.fat + 5);
      }
    } else if (ratio <= 0.85) {
      scaled.name = `${meal.name} (สั่งแบบข้าวน้อย/เน้นกับ)`;
      scaled.calories = Math.round(meal.calories * 0.8);
      scaled.protein = Math.round(meal.protein * 0.9);
      scaled.carbs = Math.round(meal.carbs * 0.7);
      scaled.fat = Math.round(meal.fat * 0.85);
    }
    return scaled;
  });

  const scaledTotal = scaledMeals.reduce((sum, m) => sum + m.calories, 0);

  return {
    date: dateStr,
    meals: scaledMeals,
    rikoComment: `ริโกะจัดสัดส่วนอาหารเพื่อสุขภาพโดยปรับปริมาณให้ได้พลังงานรวมประมาณ ${scaledTotal} kcal ให้สอดคล้องกับเป้าหมาย TDEE ${tdee} kcal ของคนเก่งแล้วน้า! 🥗✨`,
  };
};

export const getRandomMeal = (type: Meal["type"], excludeName: string | undefined, tdee: number): Meal => {
  const options = FALLBACK_MEALS[type].filter((m) => m.name !== excludeName);
  const pool = options.length > 0 ? options : FALLBACK_MEALS[type];
  const meal = { ...pool[Math.floor(Math.random() * pool.length)] };

  const averages = { breakfast: 310, lunch: 350, dinner: 285, snack: 150 };
  const baseAvg = averages[type];

  const proportions = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 };
  const targetMealCal = tdee * proportions[type];
  const ratio = targetMealCal / baseAvg;

  if (ratio >= 1.5) {
    if (type !== "snack") {
      meal.name = `${meal.name} (สั่งพิเศษ/เบิ้ลโปรตีน + ไข่ต้ม)`;
      meal.calories = Math.round(meal.calories * 1.65);
      meal.protein = Math.round(meal.protein * 1.7);
      meal.carbs = Math.round(meal.carbs * 1.6);
      meal.fat = Math.round(meal.fat * 1.4);
    } else {
      meal.name = `${meal.name} (สั่งเบิ้ล/คูณสอง)`;
      meal.calories = Math.round(meal.calories * 2);
      meal.protein = Math.round(meal.protein * 2);
      meal.carbs = Math.round(meal.carbs * 2);
      meal.fat = Math.round(meal.fat * 2);
    }
  } else if (ratio >= 1.2) {
    if (type !== "snack") {
      meal.name = `${meal.name} (สั่งแบบพิเศษ/เพิ่มเนื้อสัตว์)`;
      meal.calories = Math.round(meal.calories * 1.3);
      meal.protein = Math.round(meal.protein * 1.35);
      meal.carbs = Math.round(meal.carbs * 1.25);
      meal.fat = Math.round(meal.fat * 1.2);
    } else {
      meal.name = `${meal.name} (ทานคู่กับไข่ต้ม)`;
      meal.calories = Math.round(meal.calories + 75);
      meal.protein = Math.round(meal.protein + 6);
      meal.fat = Math.round(meal.fat + 5);
    }
  } else if (ratio <= 0.85) {
    meal.name = `${meal.name} (สั่งแบบข้าวน้อย/เน้นกับ)`;
    meal.calories = Math.round(meal.calories * 0.8);
    meal.protein = Math.round(meal.protein * 0.9);
    meal.carbs = Math.round(meal.carbs * 0.7);
    meal.fat = Math.round(meal.fat * 0.85);
  }

  return meal;
};

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

export const generateMealPlanFromAPI = async (
  dateStr: string,
  userName: string,
  tdee: number,
  goal?: string
): Promise<DailyMealPlan> => {
  try {
    const { data, error } = await supabase.functions.invoke("recommend-meals", {
      body: { date: dateStr, userName, tdee, goal }
    });

    if (!error && data && data.meals && data.meals.length === 4) {
      return {
        date: dateStr,
        meals: data.meals,
        rikoComment: data.rikoComment || "ริโกะคัดเลือกตารางอาหารสุขภาพสำหรับเป้าหมายของคุณมาให้แล้วน้าคนเก่ง! 🎀"
      };
    }

    if (error) {
      console.warn("recommend-meals edge function error, trying client-side fallback:", error);
    }
  } catch (err) {
    console.warn("recommend-meals edge function exception:", err);
  }

  try {
    const bCal = Math.round(tdee * 0.25);
    const bProt = Math.round(bCal * 0.08);
    const bFat = Math.round(bCal * 0.025);
    const bCarb = Math.round(bCal * 0.11);

    const lCal = Math.round(tdee * 0.35);
    const lProt = Math.round(lCal * 0.08);
    const lFat = Math.round(lCal * 0.025);
    const lCarb = Math.round(lCal * 0.11);

    const dCal = Math.round(tdee * 0.30);
    const dProt = Math.round(dCal * 0.08);
    const dFat = Math.round(dCal * 0.025);
    const dCarb = Math.round(dCal * 0.11);

    const sCal = Math.round(tdee * 0.10);
    const sProt = Math.round(sCal * 0.125);
    const sFat = Math.round(sCal * 0.015);
    const sCarb = Math.round(sCal * 0.075);

    let goalInstruction = "";
    if (goal) {
      if (goal === "bulk") {
        goalInstruction = `- ผู้ใช้มีเป้าหมายคือการ Bulk (เพิ่มกล้ามเนื้อ) ดังนั้นจัดตารางอาหารที่เน้นคาร์โบไฮเดรตและโปรตีนคุณภาพสูงเพื่อช่วยสร้างกล้ามเนื้อ เมนูควรเป็นสไตล์พลังงานหนาแน่น สั่งพิเศษ/เพิ่มเนื้อสัตว์/เพิ่มไข่`;
      } else if (goal === "cut" || goal === "weight_loss") {
        goalInstruction = `- ผู้ใช้มีเป้าหมายคือการ Cut (ลดไขมัน) ดังนั้นจัดตารางอาหารที่เน้นโปรตีนสูงมาก คาร์โบไฮเดรตและไขมันปานกลางถึงต่ำ เน้นใยอาหาร/ผักเยอะๆ และเนื้อสัตว์ไขมันต่ำเพื่อช่วยคุมความหิวได้ดี`;
      } else {
        goalInstruction = `- ผู้ใช้มีเป้าหมายคือการ Maintain (รักษาน้ำหนัก) จัดอาหารที่ดีต่อสุขภาพ สมดุล คาร์บ โปรตีน ไขมัน สัดส่วนดีต่อการรักษาสุขภาพโดยทั่วไป`;
      }
    }

    const prompt = `จัดตารางอาหาร 4 มื้อ (breakfast, lunch, dinner, snack) ประจำวันที่ ${dateStr} สำหรับคุณ ${userName}
ข้อกำหนดอาหาร:
- ต้องเป็นอาหารที่หาทานได้ง่ายในไทย เช่น ร้านอาหารตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยว, หรือ 7-Eleven
- มีสารอาหารครบถ้วน (โปรตีนสูง คาร์บพอดี ไขมันต่ำ)
- แคลอรีรวมทั้งหมดของทั้ง 4 มื้อควรใกล้เคียงเป้าหมายประจำวันคือ ${tdee} kcal (+/- 100 kcal) โดยเฉลี่ยแต่ละมื้อให้สัมพันธ์กับเป้าหมายนี้
${goalInstruction}
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามโครงสร้างตัวอย่างนี้เท่านั้น:
{
  "rikoComment": "ริโกะเขียนทักทายคนเก่งอย่างน่ารักสดใสค่ะ โดยจัดพลังงานรวมให้อยู่ราวๆ ${tdee} kcal ให้เข้ากับเป้าหมายค่ะ 🎀🥗",
  "meals": [
    { "type": "breakfast", "name": "ชื่ออาหารเช้า", "calories": ${bCal}, "protein": ${bProt}, "fat": ${bFat}, "carbs": ${bCarb}, "location": "ร้านข้าวแกง" },
    { "type": "lunch", "name": "ชื่ออาหารกลางวัน", "calories": ${lCal}, "protein": ${lProt}, "fat": ${lFat}, "carbs": ${lCarb}, "location": "ร้านก๋วยเตี๋ยว" },
    { "type": "dinner", "name": "ชื่ออาหารเย็น", "calories": ${dCal}, "protein": ${dProt}, "fat": ${dFat}, "carbs": ${dCarb}, "location": "ตามสั่ง" },
    { "type": "snack", "name": "ชื่อของว่าง", "calories": ${sCal}, "protein": ${sProt}, "fat": ${sFat}, "carbs": ${sCarb}, "location": "7-Eleven" }
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

  return getRandomMealPlan(dateStr, tdee);
};

export const generateSingleMealFromAPI = async (
  dateStr: string,
  mealType: Meal["type"],
  oldMealName: string,
  userName: string,
  tdee: number,
  goal?: string
): Promise<Meal> => {
  try {
    const { data, error } = await supabase.functions.invoke("recommend-meals", {
      body: { date: dateStr, userName, mealType, excludeMealName: oldMealName, tdee, goal }
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

  try {
    const singleMealCal = Math.round(tdee * (mealType === "breakfast" ? 0.25 : mealType === "lunch" ? 0.35 : mealType === "dinner" ? 0.30 : 0.10));
    const mProt = Math.round(singleMealCal * 0.08);
    const mFat = Math.round(singleMealCal * 0.025);
    const mCarb = Math.round(singleMealCal * 0.11);

    let goalInstruction = "";
    if (goal) {
      if (goal === "bulk") {
        goalInstruction = `- เป้าหมายคือการ Bulk (เพิ่มกล้ามเนื้อ/น้ำหนัก) แนะนำเมนูที่มีโปรตีนสูงและคาร์โบไฮเดรต/พลังงานที่หนาแน่น สารอาหารครบถ้วน`;
      } else if (goal === "cut" || goal === "weight_loss") {
        goalInstruction = `- เป้าหมายคือการ Cut (ลดไขมัน/ลดน้ำหนัก) แนะนำเมนูโปรตีนสูงมาก คาร์บและไขมันต่ำ เน้นผักและเนื้อสัตว์ไขมันต่ำเพื่อให้อิ่มท้องนาน`;
      } else {
        goalInstruction = `- เป้าหมายคือการ Maintain (รักษาน้ำหนัก) แนะนำเมนูที่มีความสมดุลของสารอาหารอย่างเหมาะสม`;
      }
    }

    const prompt = `แนะนำอาหารมื้อ "${mealType}" ใหม่แทนที่ "${oldMealName}" สำหรับคุณ ${userName} ในวันที่ ${dateStr}
ข้อกำหนดอาหาร:
- หาซื้อได้ง่ายในไทย เช่น ร้านตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยว, หรือ 7-Eleven
- มีโปรตีนสูง ดีต่อสุขภาพ และไม่ซ้ำกับ "${oldMealName}"
- คำนวณปริมาณพลังงานของมื้อนี้ให้สอดคล้องกับเป้าหมายแคลอรีรวมทั้งวันคือ ${tdee} kcal (มื้อนี้ประมาณ ${singleMealCal} kcal)
${goalInstruction}
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามโครงสร้างตัวอย่างนี้เท่านั้น:
{
  "type": "${mealType}",
  "name": "ชื่ออาหารใหม่",
  "calories": ${singleMealCal},
  "protein": ${mProt},
  "fat": ${mFat},
  "carbs": ${mCarb},
  "location": "ร้านก๋วยเตี๋ยว / ร้านข้าวแกง / ตามสั่ง / 7-Eleven"
}`;
    const text = await clientGeminiFallback(prompt);
    const parsed = JSON.parse(text);
    if (parsed && parsed.name && parsed.calories > 0) {
      return parsed as Meal;
    }
  } catch (err) {
    console.warn("Client fallback single meal failed, using local randomize:", err);
  }

  return getRandomMeal(mealType, oldMealName, tdee);
};
