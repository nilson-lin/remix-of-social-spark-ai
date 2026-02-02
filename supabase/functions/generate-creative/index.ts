import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildImagePrompt, buildCopyPrompt } from "./prompt-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { creativeId, niche, product, objective, social_network, tone, style, creative_type, template } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ========== GERAÇÃO DE COPY COM IA ==========
    const copyPrompt = buildCopyPrompt({
      niche,
      product,
      objective,
      social_network,
      tone,
      creative_type: creative_type || "venda",
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

    // ========== GERAÇÃO DE IMAGEM COM IA ==========
    const imagePrompt = buildImagePrompt({
      niche,
      product,
      template: template || style || "minimalista",
      creative_type: creative_type || "venda",
      social_network,
      objective,
      tone,
    });

    console.log("Generating image with modular prompt...");
    console.log("Image prompt preview:", imagePrompt.substring(0, 300) + "...");

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
        
        // Extrai URL da imagem
        imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageUrl) {
          console.log("Image URL obtained successfully, length:", imageUrl.length);
        } else {
          console.error("Image URL not found. Response structure:", JSON.stringify(imageData).substring(0, 800));
        }
      } else {
        const errorText = await imageResponse.text();
        console.error("Image generation failed:", imageResponse.status, errorText);
      }
    } catch (imageError) {
      console.error("Image generation error:", imageError);
    }

    // ========== ATUALIZA CRIATIVO NO BANCO ==========
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
