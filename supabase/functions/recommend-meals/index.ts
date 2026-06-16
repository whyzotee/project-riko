import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestPayload {
  date: string;
  userName: string;
  tdee?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  excludeMealName?: string;
}

console.info('recommend-meals server started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SB_PUBLISHABLE_KEY')!
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ error: 'No authorization header found' }, { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { claims }, error: authError } = await supabase.auth.getClaims(token)

    if (authError || !claims) {
      return Response.json({
        error: "Unauthorized: Please log in to request recommendations.",
      }, { status: 401, headers: corsHeaders });
    }

    // 2. Parse Request Payload
    const { date, userName, tdee, mealType, excludeMealName }: RequestPayload = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const targetTdee = tdee || 1800; // Fallback default if not provided

    let prompt = "";
    if (mealType) {
      prompt = `คุณคือ Coach Riko (โค้ชริโกะ) แนะนำเมนูอาหารทางเลือกใหม่
ความต้องการ: แนะนำเมนูใหม่สำหรับมื้อ "${mealType}" แทนที่เมนูเดิมชื่อ "${excludeMealName || ""}" ของคุณ ${userName} ในวันที่ ${date}
ข้อกำหนดอาหาร:
- ต้องเป็นอาหารที่หาทานได้ง่ายในไทย เช่น ร้านอาหารตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยว, หรือ 7-Eleven ในประเทศไทย
- อาหารสุขภาพ โปรตีนสูง แคลอรีพอดี คาร์บและไขมันสมดุล
- ห้ามเสนอเมนูเดิมที่ชื่อว่า "${excludeMealName || ""}" เด็ดขาด
- คำนวณปริมาณพลังงานและสารอาหารของมื้อนี้ให้เหมาะสมกับเป้าหมายแคลอรีประจำวันคือ ${targetTdee} kcal (เฉลี่ยให้เหมาะสมกับสัดส่วนมื้อ)
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามตัวอย่างนี้เท่านั้น:
{
  "type": "${mealType}",
  "name": "ชื่ออาหารทางเลือกใหม่ที่ดีต่อสุขภาพ",
  "calories": 250,
  "protein": 22,
  "fat": 6,
  "carbs": 30,
  "location": "ตามสั่ง / ร้านข้าวแกง / ร้านก๋วยเตี๋ยว / 7-Eleven"
}`;
    } else {
      prompt = `คุณคือ Coach Riko (โค้ชริโกะ) นักกำหนดอาหารและผู้ช่วยส่วนตัวสุดน่ารัก
ความต้องการ: จัดตารางอาหาร 4 มื้อ (breakfast, lunch, dinner, snack) ประจำวันที่ ${date} สำหรับคุณ ${userName}
ข้อกำหนดอาหาร:
- ต้องเป็นอาหารที่หาทานได้ง่ายในประเทศไทย เช่น ร้านอาหารตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยวชนิดต่างๆ, หรือของกินใน 7-Eleven
- อาหารเพื่อสุขภาพ มีสารอาหารครบถ้วน (โปรตีนสูง คาร์บพอดี ไขมันต่ำ)
- แคลอรีรวมของทั้ง 4 มื้อ (เช้า + กลางวัน + เย็น + ของว่าง) ต้องมีค่าใกล้เคียงกับค่า TDEE เป้าหมายประจำวันของผู้ใช้คือ ${targetTdee} kcal (+/- 100 kcal) โดยเฉลี่ยแต่ละมื้อให้สัมพันธ์กับเป้าหมายนี้ (เช่น มื้อเช้า 25%, มื้อกลางวัน 35%, มื้อเย็น 30%, ของว่าง 10% ของแคลอรีเป้าหมาย)
- ให้คุณเขียน rikoComment ให้กำลังใจสั้นๆ สไตล์โค้ชริโกะที่น่ารัก สดใส พูดภาษาไทยลงท้ายด้วย ค่ะ/นะคะ/น้า มีอิโมจิน่ารักๆ
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามโครงสร้างตัวอย่างนี้เท่านั้น:
{
  "rikoComment": "ริโกะเขียนทักทายคุณ ${userName} และอธิบายตารางอาหารสุขภาพวันนี้สั้นๆ อย่างน่ารักสดใสค่ะ โดยรวมแคลอรีมื้ออาหารให้ได้ใกล้เคียง ${targetTdee} kcal ตามเป้าหมายค่ะ 🎀🥗",
  "meals": [
    {
      "type": "breakfast",
      "name": "ชื่ออาหารเช้า",
      "calories": 280,
      "protein": 24,
      "fat": 8,
      "carbs": 32,
      "location": "7-Eleven / ร้านข้าวแกง"
    },
    {
      "type": "lunch",
      "name": "ชื่ออาหารกลางวัน",
      "calories": 450,
      "protein": 30,
      "fat": 12,
      "carbs": 55,
      "location": "ตามสั่ง / ร้านก๋วยเตี๋ยว"
    },
    {
      "type": "dinner",
      "name": "ชื่ออาหารเย็น",
      "calories": 320,
      "protein": 28,
      "fat": 6,
      "carbs": 38,
      "location": "ตามสั่ง / ร้านข้าวแกง"
    },
    {
      "type": "snack",
      "name": "ชื่อของว่าง",
      "calories": 160,
      "protein": 20,
      "fat": 2,
      "carbs": 12,
      "location": "7-Eleven"
    }
  ]
}`;
    }

    // 3. Request Gemini API
    const selectedModel = "gemini-3.1-flash-lite"; // Primary model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7
        }
      })
    });

    const result = await geminiResponse.json();

    if (!geminiResponse.ok || result.error) {
      const status = geminiResponse.status;
      const errorDetail = result.error;
      console.error(`Gemini API Error (${status}):`, JSON.stringify(errorDetail, null, 2));

      return Response.json({
        error: errorDetail?.message || "Gemini API Error",
        status
      }, { status: status === 429 ? 429 : 500, headers: corsHeaders });
    }

    const text = result.candidates[0].content.parts[0].text;
    console.log("Gemini recommend-meals success");

    // Return the JSON directly to client
    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("recommend-meals function error:", message);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
