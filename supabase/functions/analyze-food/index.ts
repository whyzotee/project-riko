import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestPayload {
  image?: string;
  description?: string;
}

console.info('analyze-food server started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SB_PUBLISHABLE_KEY')!
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get and Verify JWT using getClaims (fastest method)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ error: 'No authorization header found' }, { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { claims }, error: authError } = await supabase.auth.getClaims(token)

    if (authError || !claims) {
      console.error("Authentication Error:", authError?.message || "Invalid JWT");
      return Response.json({
        error: "Unauthorized: Please log in to use AI analysis.",
        details: authError?.message
      }, { status: 401, headers: corsHeaders });
    }

    // 2. Process Request
    const { image, description }: RequestPayload = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    let prompt = "Analyze the food. Return ONLY a JSON object with: food_name, calories, protein, carbs, fat, sugar, sodium, cholesterol, serving_size, unit. All nutritional values should be numbers. No formatting, no markdown.";

    if (description) {
      prompt += ` Specifically consider these details: ${description}. Use them to provide an extremely accurate nutritional breakdown.`;
    }

    const parts: (
      | { text: string }
      | { inline_data: { mime_type: string; data: string } }
    )[] = [{ text: prompt }];

    if (image) {
      const mimeMatch = image.match(/^data:([^;]+);base64,(.+)$/);
      if (!mimeMatch) throw new Error("Invalid image format");

      const mimeType = mimeMatch[1];
      const base64Data = mimeMatch[2];
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    // 3. Call Gemini AI
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: parts
          }
        ],
        generationConfig: {
          response_mime_type: "application/json"
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
    console.log("Gemini Success:", text);

    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Edge Function Error:", message);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
