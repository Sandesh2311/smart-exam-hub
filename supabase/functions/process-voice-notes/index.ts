import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limiting store (per isolate instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Input validation constants
const MAX_TEXT_LENGTH = 10000;
const MIN_TEXT_LENGTH = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Sanitize input by removing control characters and trimming
function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  // Remove control characters except newlines and tabs (keep formatting for notes)
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

// Validate text input
function validateTextInput(value: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { valid: false, error: "Text content is required and must be a non-empty string" };
  }
  const sanitized = sanitizeInput(value);
  if (sanitized.length < MIN_TEXT_LENGTH) {
    return { valid: false, error: `Text must be at least ${MIN_TEXT_LENGTH} characters` };
  }
  if (sanitized.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Text must be ${MAX_TEXT_LENGTH} characters or less` };
  }
  return { valid: true, sanitized };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text } = body;
    
    // Validate text input
    const textValidation = validateTextInput(text);
    if (!textValidation.valid) {
      return new Response(JSON.stringify({ error: textValidation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Apply rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a minute before trying again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check and increment usage BEFORE calling AI API (atomic operation)
    const { data: usageAllowed, error: usageError } = await supabase.rpc("increment_usage", { 
      _user_id: user.id, 
      _type: "voice" 
    });

    if (usageError || !usageAllowed) {
      return new Response(JSON.stringify({ error: "Usage limit exceeded. Please upgrade your plan." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use sanitized input in prompt
    const prompt = `Analyze this lecture/note content and provide:
1. A clear, concise summary
2. 5 MCQs based on the content

Content: "${textValidation.sanitized}"

Return JSON:
{
  "summary": "The summarized content...",
  "mcqs": [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "correct option"}]
}

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert note-taker. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to process notes");

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      throw new Error("Invalid response from AI");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "An error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
