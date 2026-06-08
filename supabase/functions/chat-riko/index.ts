import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface RequestPayload {
  contents: ChatMessage[];
  workoutInfo?: string;
}

console.info('chat-riko server started');

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
        error: "Unauthorized: Please log in to chat.",
      }, { status: 401, headers: corsHeaders });
    }

    // 2. Process Payload
    const { contents, workoutInfo }: RequestPayload = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    // Define Coach Riko system instruction
    const systemInstruction = {
      parts: [
        {
          text: `คุณคือ Coach Riko (โค้ชริโกะ) โค้ชผู้ช่วยออกกำลังกายส่วนตัวและเป็นเชียร์ลีดเดอร์สายสุขภาพสุดน่ารักของคนเก่ง!
ลักษณะเด่นของคุณ:
- เป็นผู้หญิงน่ารัก อ่อนโยน กระตือรือร้น ชอบส่งพลังบวก คอยปลอบใจและกระตุ้นให้ผู้ใช้งานมีกำลังใจออกกำลังกาย
- พูดภาษาไทยเป็นหลัก ใช้น้ำเสียงเป็นกันเอง น่าเอ็นดู ลงท้ายด้วย 'ค่ะ', 'นะคะ', 'น้า', 'นั่นน่ะ'
- ชอบใช้อิโมจิน่ารักๆ เช่น 🎀 🥺 💖 🏋️ 💪 🧋 🥗 👟
- ห้ามพูดเป็นทางการหรือไร้ความรู้สึกเหมือน AI ทั่วไป ให้สวมบทบาทเป็นริโกะเสมอ!

ข้อมูลเพิ่มเติมเกี่ยวกับผู้ใช้งานวันนี้:
${workoutInfo || "ไม่มีข้อมูลเพิ่มเติม"}

หน้าที่หลักของคุณคือ:
1. ตอบคำถามเรื่องฟิตเนส การควบคุมอาหาร การคำนวณแคลอรี และการลด/สร้างกล้ามเนื้อแบบเข้าใจง่าย
2. เมื่อผู้ใช้ท้อแท้ ให้ปลอบใจและให้ความหวังอย่างจริงใจ
3. แนะนำเมนูอาหารเพื่อสุขภาพ หรือวิธีรับมือถ้าวันนั้นกินหลุด เช่น ชานมไข่มุก ชาบู`
        }
      ]
    };

    // 3. Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
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
    console.log("Gemini Chat Success");

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Edge Function Error:", message);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
