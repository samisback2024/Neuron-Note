// Supabase Edge Function for AI Chat
// Deploy: supabase functions deploy ai-chat
// Set secret: supabase secrets set OPENAI_API_KEY=your_key

// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      console.error(
        "[ai-chat] Missing or invalid 'message' in request body:",
        body,
      );
      return jsonResponse(
        {
          reply: "Invalid request: 'message' field is required.",
          error: "INVALID_BODY",
        },
        400,
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      console.error(
        "[ai-chat] OPENAI_API_KEY is not set. Run: supabase secrets set OPENAI_API_KEY=sk-...",
      );
      return jsonResponse({
        reply:
          "AI features require an OpenAI API key. Please run: supabase secrets set OPENAI_API_KEY=your-key",
        error: "MISSING_API_KEY",
      });
    }

    console.log(
      "[ai-chat] Calling OpenAI for message:",
      message.substring(0, 80),
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Neuron AI, an intelligent assistant for a productivity and knowledge management app. Help users with their notes, tasks, and knowledge. Be concise, helpful, and friendly.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data);
      console.error(`[ai-chat] OpenAI API error (${response.status}):`, errMsg);
      return jsonResponse(
        {
          reply:
            "The AI service returned an error. Please check your API key and account status.",
          error: "OPENAI_ERROR",
          detail: errMsg,
        },
        502,
      );
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error(
        "[ai-chat] No choices in OpenAI response:",
        JSON.stringify(data).substring(0, 300),
      );
      return jsonResponse(
        {
          reply: "I couldn't generate a response. Please try again.",
          error: "EMPTY_RESPONSE",
        },
        502,
      );
    }

    console.log("[ai-chat] Success, reply length:", reply.length);
    return jsonResponse({ reply });
  } catch (err) {
    console.error("[ai-chat] Unhandled error:", err);
    return jsonResponse(
      {
        reply:
          "An unexpected error occurred. Check Supabase function logs for details.",
        error: "INTERNAL_ERROR",
      },
      500,
    );
  }
});
