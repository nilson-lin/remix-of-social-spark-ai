import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { buildImagePrompt, buildCopyPrompt } from "./prompt-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const CreativeInputSchema = z.object({
  creativeId: z.string().uuid(),
  niche: z.string().min(2).max(100),
  product: z.string().min(2).max(200),
  objective: z.enum(['sales', 'leads', 'engagement', 'brand']),
  social_network: z.enum(['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter']),
  tone: z.string().min(2).max(50),
  style: z.string().min(2).max(50),
  creative_type: z.enum(['venda', 'promocao', 'branding', 'autoridade', 'storytelling']).optional().default('venda'),
  template: z.enum(['minimalista', 'publicitario', 'dark_premium', 'clean', 'chamativo']).optional().default('minimalista'),
});

// Sanitize text for AI prompts
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim()
    .substring(0, 500); // Hard limit
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AUTHENTICATION ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // === INPUT VALIDATION ===
    const body = await req.json();
    const parseResult = CreativeInputSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: parseResult.error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { creativeId, niche, product, objective, social_network, tone, style, creative_type, template } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // === VERIFY CREATIVE OWNERSHIP ===
    const { data: creative, error: creativeError } = await supabase
      .from('creatives')
      .select('user_id')
      .eq('id', creativeId)
      .single();

    if (creativeError || !creative) {
      return new Response(
        JSON.stringify({ error: 'Creative not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (creative.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not own this creative' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === CHECK AND DEDUCT CREDITS (Server-side) ===
    const { data: hasCredits, error: creditError } = await supabase
      .rpc('check_and_deduct_credits', {
        _user_id: userId,
        _credit_cost: 1
      });

    if (creditError) {
      console.error("Credit check error:", creditError);
      throw new Error("Failed to verify credits");
    }

    if (!hasCredits) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Credits verified and deducted");

    // ========== COPY GENERATION WITH AI ==========
    const copyPrompt = buildCopyPrompt({
      niche: sanitizeForPrompt(niche),
      product: sanitizeForPrompt(product),
      objective,
      social_network,
      tone: sanitizeForPrompt(tone),
      creative_type,
    });

    console.log("Generating copy with AI...");

    const copyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: copyPrompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_creative_copy",
              description: "Generate 3 variations of creative copy",
              parameters: {
                type: "object",
                properties: {
                  variations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        headline: { type: "string" },
                        text: { type: "string" },
                        cta: { type: "string" },
                      },
                      required: ["headline", "text", "cta"],
                    },
                  },
                },
                required: ["variations"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_creative_copy" } },
      }),
    });

    if (!copyResponse.ok) {
      const errorText = await copyResponse.text();
      console.error("AI copy error:", copyResponse.status, errorText);
      throw new Error("Failed to generate copy");
    }

    const copyData = await copyResponse.json();
    const toolCall = copyData.choices?.[0]?.message?.tool_calls?.[0];
    
    let variations = [];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      variations = args.variations || [];
    }

    const mainVariation = variations[0] || { headline: product, text: "", cta: "Saiba mais" };
    console.log("Copy generated successfully, variations:", variations.length);

    // ========== IMAGE GENERATION WITH AI ==========
    const imagePrompt = buildImagePrompt({
      niche: sanitizeForPrompt(niche),
      product: sanitizeForPrompt(product),
      template: template || style || "minimalista",
      creative_type: creative_type || "venda",
      social_network,
      objective,
      tone: sanitizeForPrompt(tone),
    });

    console.log("Generating image with modular prompt...");

    let imageUrl = null;
    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        console.log("Image response received");
        
        imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageUrl) {
          console.log("Image URL obtained successfully");
        } else {
          console.error("Image URL not found in response");
        }
      } else {
        const errorText = await imageResponse.text();
        console.error("Image generation failed:", imageResponse.status, errorText);
      }
    } catch (imageError) {
      console.error("Image generation error:", imageError);
    }

    // ========== UPDATE CREATIVE IN DATABASE ==========
    const { error: updateError } = await supabase
      .from("creatives")
      .update({
        headline: mainVariation.headline,
        main_text: mainVariation.text,
        cta: mainVariation.cta,
        variations: variations,
        image_url: imageUrl,
        status: "completed",
      })
      .eq("id", creativeId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("Creative generation completed successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-creative error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
