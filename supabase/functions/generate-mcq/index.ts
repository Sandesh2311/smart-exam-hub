import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, topic, difficulty, count } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check user auth and increment usage
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc("increment_usage", { _user_id: user.id, _type: "mcq" });
      }
    }

    const prompt = `Generate ${count} multiple choice questions about ${topic} in ${subject}. Difficulty: ${difficulty}.

Return a JSON array with this exact format:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text (must match one of the options exactly)",
    "explanation": "Brief explanation of why this is correct"
  }
]

Requirements:
- Each question must have exactly 4 options
- The answer must be the full text of the correct option
- Make questions appropriate for ${difficulty} difficulty level
- Questions should be educational and accurate
- Return ONLY the JSON array, no other text`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert educator who creates high-quality MCQ questions. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to generate MCQs");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";
    
    // Parse JSON from response
    let mcqs;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      mcqs = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response from AI");
    }

    return new Response(JSON.stringify({ mcqs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
