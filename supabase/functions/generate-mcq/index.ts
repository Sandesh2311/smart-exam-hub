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
const MAX_SUBJECT_LENGTH = 100;
const MAX_TOPIC_LENGTH = 200;
const MIN_COUNT = 1;
const MAX_COUNT = 10;
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

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
  // Remove control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

// Validate string input
function validateStringInput(value: unknown, fieldName: string, maxLength: number): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { valid: false, error: `${fieldName} is required and must be a non-empty string` };
  }
  const sanitized = sanitizeInput(value);
  if (sanitized.length > maxLength) {
    return { valid: false, error: `${fieldName} must be ${maxLength} characters or less` };
  }
  if (sanitized.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty after sanitization` };
  }
  return { valid: true, sanitized };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { subject, topic, difficulty, count } = body;
    
    // Validate subject
    const subjectValidation = validateStringInput(subject, "Subject", MAX_SUBJECT_LENGTH);
    if (!subjectValidation.valid) {
      return new Response(JSON.stringify({ error: subjectValidation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Validate topic
    const topicValidation = validateStringInput(topic, "Topic", MAX_TOPIC_LENGTH);
    if (!topicValidation.valid) {
      return new Response(JSON.stringify({ error: topicValidation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Validate difficulty
    const sanitizedDifficulty = typeof difficulty === "string" ? difficulty.toLowerCase().trim() : "";
    if (!VALID_DIFFICULTIES.includes(sanitizedDifficulty)) {
      return new Response(JSON.stringify({ error: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Validate count
    const parsedCount = typeof count === "number" ? count : parseInt(count, 10);
    if (isNaN(parsedCount) || parsedCount < MIN_COUNT || parsedCount > MAX_COUNT) {
      return new Response(JSON.stringify({ error: `Count must be between ${MIN_COUNT} and ${MAX_COUNT}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
      _type: "mcq" 
    });

    if (usageError || !usageAllowed) {
      return new Response(JSON.stringify({ error: "Usage limit exceeded. Please upgrade your plan." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use sanitized inputs in prompt
    const prompt = `Generate ${parsedCount} multiple choice questions about ${topicValidation.sanitized} in ${subjectValidation.sanitized}. Difficulty: ${sanitizedDifficulty}.

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
- Make questions appropriate for ${sanitizedDifficulty} difficulty level
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
      console.error("AI Gateway error:", response.status);
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
      console.error("Failed to parse AI response");
      throw new Error("Invalid response from AI");
    }

    return new Response(JSON.stringify({ mcqs }), {
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
