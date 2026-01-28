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
    const { subject, topics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.rpc("increment_usage", { _user_id: user.id, _type: "paper" });
    }

    const prompt = `Create a question paper for ${subject} covering: ${topics}.

Return JSON with this format:
{
  "oneMarks": [{"question": "...", "marks": 1, "answer": "..."}],
  "twoMarks": [{"question": "...", "marks": 2, "answer": "..."}],
  "fiveMarks": [{"question": "...", "marks": 5, "answer": "..."}]
}

Generate 5 one-mark, 4 two-mark, and 3 five-mark questions. Return ONLY JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert educator. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to generate paper");

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    
    let paper;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      paper = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      throw new Error("Invalid response from AI");
    }

    return new Response(JSON.stringify({ paper }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
