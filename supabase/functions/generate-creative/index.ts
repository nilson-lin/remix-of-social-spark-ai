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
    const { creativeId, niche, product, objective, social_network, tone, style } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate copy with AI
    const objectiveLabels: Record<string, string> = {
      sales: "vendas diretas",
      leads: "captação de leads",
      engagement: "engajamento e interação",
      brand: "reconhecimento de marca",
    };

    const toneLabels: Record<string, string> = {
      professional: "profissional e corporativo",
      informal: "informal e descontraído",
      persuasive: "persuasivo e convincente",
      creative: "criativo e inovador",
    };

    const networkLabels: Record<string, string> = {
      instagram: "Instagram (feed/stories)",
      facebook: "Facebook (anúncios)",
      tiktok: "TikTok (vídeos curtos)",
      google_ads: "Google Ads (pesquisa/display)",
    };

    const copyPrompt = `Você é um copywriter especialista em marketing digital e redes sociais. Crie um criativo completo para a seguinte campanha:

Nicho: ${niche}
Produto/Serviço: ${product}
Objetivo: ${objectiveLabels[objective] || objective}
Rede Social: ${networkLabels[social_network] || social_network}
Tom: ${toneLabels[tone] || tone}

Gere exatamente 3 variações diferentes de copy, cada uma com:
1. Headline (título chamativo, máximo 10 palavras)
2. Texto principal (copy persuasiva, 50-100 palavras)
3. CTA (chamada para ação, máximo 5 palavras)

Responda usando a função fornecida.`;

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

    // Generate image with AI
    const styleLabels: Record<string, string> = {
      minimalist: "minimalist, clean, white space, elegant typography, simple composition",
      advertising: "advertising, vibrant, eye-catching, bold colors, dynamic",
      realistic: "photorealistic, high quality, professional photography",
      modern: "modern, futuristic, gradients, contemporary design, sleek",
    };

    const styleDescription = styleLabels[style] || "professional, high quality";
    
    const imagePrompt = `Create a stunning ${styleDescription} social media advertisement image.

Subject: ${product}
Industry: ${niche}
Platform: ${social_network}

Requirements:
- Ultra high resolution, professional quality
- Perfect for ${social_network} ads
- 1:1 square aspect ratio
- No text or words in the image
- Clean, visually appealing composition
- ${styleDescription} aesthetic`;

    console.log("Generating image with prompt:", imagePrompt);

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
        console.log("Image response received, extracting URL...");
        imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl) {
          console.log("Image URL obtained, length:", imageUrl.length);
        } else {
          console.error("Image URL not found in response:", JSON.stringify(imageData).substring(0, 500));
        }
      } else {
        const errorText = await imageResponse.text();
        console.error("Image generation failed:", imageResponse.status, errorText);
      }
    } catch (imageError) {
      console.error("Image generation error:", imageError);
    }

    // Update the creative in database
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
