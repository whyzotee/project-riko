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
  goal?: string;
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
    const { date, userName, tdee, mealType, excludeMealName, goal }: RequestPayload = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const targetTdee = tdee || 1800; // Fallback default if not provided

    // Calculate dynamic values for the prompt few-shot example to prevent Gemini from copying static low-calorie figures
    const bCal = Math.round(targetTdee * 0.25);
    const bProt = Math.round(bCal * 0.08); 
    const bFat = Math.round(bCal * 0.025);
    const bCarb = Math.round(bCal * 0.11);

    const lCal = Math.round(targetTdee * 0.35);
    const lProt = Math.round(lCal * 0.08);
    const lFat = Math.round(lCal * 0.025);
    const lCarb = Math.round(lCal * 0.11);

    const dCal = Math.round(targetTdee * 0.30);
    const dProt = Math.round(dCal * 0.08);
    const dFat = Math.round(dCal * 0.025);
    const dCarb = Math.round(dCal * 0.11);

    const sCal = Math.round(targetTdee * 0.10);
    const sProt = Math.round(sCal * 0.125); 
    const sFat = Math.round(sCal * 0.015);
    const sCarb = Math.round(sCal * 0.075);

    let prompt = "";
    if (mealType) {
      const singleMealCal = Math.round(targetTdee * (mealType === "breakfast" ? 0.25 : mealType === "lunch" ? 0.35 : mealType === "dinner" ? 0.30 : 0.10));
      const mProt = Math.round(singleMealCal * 0.08);
      const mFat = Math.round(singleMealCal * 0.025);
      const mCarb = Math.round(singleMealCal * 0.11);

      let goalInstruction = "";
      if (goal) {
        if (goal === "bulk") {
          goalInstruction = `- เป้าหมายคือการ Bulk (เพิ่มกล้ามเนื้อ/น้ำหนัก) แนะนำเมนูที่มีโปรตีนสูงและคาร์โบไฮเดรต/พลังงานที่หนาแน่น สารอาหารครบถ้วน`;
        } else if (goal === "cut" || goal === "weight_loss") {
          goalInstruction = `- เป้าหมายคือการ Cut (ลดไขมัน/ลดน้ำหนัก) แนะนำเมนูโปรตีนสูงมาก คาร์บและไขมันต่ำ เน้นผักและเนื้อสัตว์ไขมันต่ำเพื่อให้อิ่มท้องนาน (Satiety)`;
        } else {
          goalInstruction = `- เป้าหมายคือการ Maintain (รักษาน้ำหนัก) แนะนำเมนูที่มีความสมดุลของสารอาหารอย่างเหมาะสม`;
        }
      }

      prompt = `คุณคือ Coach Riko (โค้ชริโกะ) แนะนำเมนูอาหารทางเลือกใหม่
ความต้องการ: แนะนำเมนูใหม่สำหรับมื้อ "${mealType}" แทนที่เมนูเดิมชื่อ "${excludeMealName || ""}" ของคุณ ${userName} ในวันที่ ${date}
ข้อกำหนดอาหาร:
- ต้องเป็นอาหารที่หาทานได้ง่ายในไทย เช่น ร้านอาหารตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยว, หรือ 7-Eleven ในประเทศไทย
- อาหารสุขภาพ โปรตีนสูง แคลอรีพอดี คาร์บและไขมันสมดุล
- ห้ามเสนอเมนูเดิมที่ชื่อว่า "${excludeMealName || ""}" เด็ดขาด
- ห้ามระบุปริมาณเจาะจงเกินไปในชื่ออาหาร (เช่น ห้ามเขียน "ข้าวสวย 2 ทัพพี", "เนื้อหมู 150 กรัม") ให้เขียนเมนูในลักษณะที่สามารถสั่งตามร้านจริงได้ เช่น "เกาเหลาพิเศษน้ำใส + ข้าวเปล่า"
${goalInstruction}
- คำนวณปริมาณพลังงานและสารอาหารของมื้อนี้ให้เหมาะสมกับเป้าหมายแคลอรีประจำวันของมื้อนี้คือประมาณ ${singleMealCal} kcal
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามตัวอย่างนี้เท่านั้น:
{
  "type": "${mealType}",
  "name": "ชื่ออาหารทางเลือกใหม่ที่ดีต่อสุขภาพ",
  "calories": ${singleMealCal},
  "protein": ${mProt},
  "fat": ${mFat},
  "carbs": ${mCarb},
  "location": "ตามสั่ง / ร้านข้าวแกง / ร้านก๋วยเตี๋ยว / 7-Eleven"
}`;
    } else {
      let goalInstruction = "";
      if (goal) {
        if (goal === "bulk") {
          goalInstruction = `- ผู้ใช้มีเป้าหมายคือการ Bulk (เพิ่มกล้ามเนื้อ) ดังนั้นควรจัดตารางอาหารที่เน้นคาร์โบไฮเดรตและโปรตีนคุณภาพสูงเพื่อช่วยสร้างกล้ามเนื้อ เมนูควรเป็นสไตล์พลังงานหนาแน่น สั่งพิเศษ/เพิ่มเนื้อสัตว์/เพิ่มไข่`;
        } else if (goal === "cut" || goal === "weight_loss") {
          goalInstruction = `- ผู้ใช้มีเป้าหมายคือการ Cut (ลดไขมัน) ดังนั้นควรจัดตารางอาหารที่เน้นโปรตีนสูงมาก คาร์โบไฮเดรตและไขมันปานกลางถึงต่ำ เน้นใยอาหาร/ผักเยอะๆ และเนื้อสัตว์ไขมันต่ำเพื่อช่วยคุมความหิวได้ดี`;
        } else {
          goalInstruction = `- ผู้ใช้มีเป้าหมายคือการ Maintain (รักษาน้ำหนัก) จัดอาหารที่ดีต่อสุขภาพ สมดุล คาร์บ โปรตีน ไขมัน สัดส่วนดีต่อการรักษาสุขภาพโดยทั่วไป`;
        }
      }

      prompt = `คุณคือ Coach Riko (โค้ชริโกะ) นักกำหนดอาหารและผู้ช่วยส่วนตัวสุดน่ารัก
ความต้องการ: จัดตารางอาหาร 4 มื้อ (breakfast, lunch, dinner, snack) ประจำวันที่ ${date} สำหรับคุณ ${userName}
ข้อกำหนดอาหาร:
- ต้องเป็นอาหารที่หาทานได้ง่ายในประเทศไทย เช่น ร้านอาหารตามสั่ง, ร้านข้าวแกง, ร้านก๋วยเตี๋ยวชนิดต่างๆ, หรือของกินใน 7-Eleven
- อาหารเพื่อสุขภาพ มีสารอาหารครบถ้วน (โปรตีนสูง คาร์บพอดี ไขมันต่ำ)
- ห้ามระบุปริมาณที่ละเอียดหรือวัดปริมาณยุ่งยากในชื่ออาหาร (เช่น ห้ามใช้คำว่า "ข้าวสวย 2 ทัพพี", "เนื้อหมู 150 กรัม", หรือ "กล้วยหอม 1.5 ลูก") ให้เขียนเป็นชื่อเมนูสไตล์ร้านข้างทางทั่วไป เช่น "ข้าวกะเพราอกไก่พิเศษน้ำมันน้อย + ไข่ดาว", "เส้นหมี่น้ำใสพิเศษอกไก่ฉีก", "ข้าวแกงส้มผักรวม + ไข่ต้ม"
${goalInstruction}
- แคลอรีรวมของทั้ง 4 มื้อ (เช้า + กลางวัน + เย็น + ของว่าง) ต้องมีค่าใกล้เคียงกับค่า TDEE เป้าหมายประจำวันของผู้ใช้คือ ${targetTdee} kcal (+/- 100 kcal) โดยเฉลี่ยแต่ละมื้อให้สัมพันธ์กับเป้าหมายนี้
- ให้คุณเขียน rikoComment ให้กำลังใจสั้นๆ สไตล์โค้ชริโกะที่น่ารัก สดใส พูดภาษาไทยลงท้ายด้วย ค่ะ/นะคะ/น้า มีอิโมจิน่ารักๆ
- ให้ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามโครงสร้างตัวอย่างนี้เท่านั้น:
{
  "rikoComment": "ริโกะเขียนทักทายคุณ ${userName} และอธิบายตารางอาหารสุขภาพวันนี้สั้นๆ อย่างน่ารักสดใสค่ะ โดยรวมแคลอรีมื้ออาหารให้ได้ใกล้เคียง ${targetTdee} kcal ตามเป้าหมายค่ะ 🎀🥗",
  "meals": [
    {
      "type": "breakfast",
      "name": "ชื่ออาหารเช้า",
      "calories": ${bCal},
      "protein": ${bProt},
      "fat": ${bFat},
      "carbs": ${bCarb},
      "location": "7-Eleven / ร้านข้าวแกง"
    },
    {
      "type": "lunch",
      "name": "ชื่ออาหารกลางวัน",
      "calories": ${lCal},
      "protein": ${lProt},
      "fat": ${lFat},
      "carbs": ${lCarb},
      "location": "ตามสั่ง / ร้านก๋วยเตี๋ยว"
    },
    {
      "type": "dinner",
      "name": "ชื่ออาหารเย็น",
      "calories": ${dCal},
      "protein": ${dProt},
      "fat": ${dFat},
      "carbs": ${dCarb},
      "location": "ตามสั่ง / ร้านข้าวแกง"
    },
    {
      "type": "snack",
      "name": "ชื่อของว่าง",
      "calories": ${sCal},
      "protein": ${sProt},
      "fat": ${sFat},
      "carbs": ${sCarb},
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
