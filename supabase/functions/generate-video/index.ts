import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev";

// Generate an enhanced image using the Lovable AI Gateway image generation model
async function generateEnhancedImage(
  prompt: string,
  sourceImageUrl: string,
  apiKey: string
): Promise<string | null> {
  console.log("Generating enhanced image with prompt:", prompt.substring(0, 200));
  
  const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: sourceImageUrl
              }
            }
          ]
        }
      ],
      modalities: ["image", "text"]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gateway error response:", errorText);
    throw new Error(`Gateway error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log("Image generation result keys:", Object.keys(result));
  
  // Extract image URL from response
  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (imageUrl) {
    console.log("Got base64 image, length:", imageUrl.length);
    return imageUrl;
  }
  
  return null;
}

// Upload base64 image to Supabase storage and return public URL
async function uploadBase64ToStorage(
  supabase: any,
  base64Data: string,
  videoId: string
): Promise<string> {
  // Extract the actual base64 content
  const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
  
  const fileName = `${videoId}/generated-${Date.now()}.png`;
  
  const { data, error } = await supabase.storage
    .from('video-uploads')
    .upload(fileName, imageBuffer, {
      contentType: 'image/png',
      upsert: true
    });
  
  if (error) {
    console.error("Storage upload error:", error);
    throw error;
  }
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('video-uploads')
    .getPublicUrl(fileName);
  
  return publicUrlData.publicUrl;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let requestVideoId: string | undefined;

  try {
    const body = await req.json();
    const { videoId, title, description, sourceImages, platform, style } = body ?? {};
    requestVideoId = videoId;

    if (!videoId) throw new Error("Missing videoId");
    if (!title) throw new Error("Missing title");
    if (!Array.isArray(sourceImages) || sourceImages.length === 0) throw new Error("Missing sourceImages");

    console.log("Generate video request:", { videoId, title, platform, style });
    console.log("Source images:", sourceImages);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build prompt for image enhancement/generation
    const prompt = buildImagePrompt(title, description ?? "", platform ?? "reels", style || "cinematic");
    console.log("Image prompt:", prompt);

    // Use the first image as the source
    const sourceImage = sourceImages[0];

    // Generate enhanced image using Lovable AI
    console.log("Calling Lovable AI for image generation...");

    const generatedImageData = await generateEnhancedImage(prompt, sourceImage, LOVABLE_API_KEY);

    if (!generatedImageData) {
      throw new Error("Falha ao gerar imagem: não foi possível obter a imagem gerada.");
    }

    // Upload the generated image to storage
    console.log("Uploading generated image to storage...");
    const imageUrl = await uploadBase64ToStorage(supabase, generatedImageData, videoId);
    
    console.log("Generated image URL:", imageUrl);
    const thumbnailUrl = sourceImages[0];

    // Update video record with the generated image as the "video" URL
    // Note: Since true video generation is not available, we generate an enhanced image
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        video_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId);

    if (updateError) {
      console.error("Error updating video:", updateError);
      throw updateError;
    }

    console.log("Image generation completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        videoUrl: imageUrl,
        note: "Imagem aprimorada gerada com sucesso. Geração de vídeo verdadeira não está disponível no momento."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in generate-video function:", error);

    // Best-effort: mark the video as failed if we know the id
    try {
      if (requestVideoId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from("videos")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", requestVideoId);
      }
    } catch (updateFail) {
      console.error("Failed to mark video as failed:", updateFail);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function buildImagePrompt(title: string, description: string, platform: string, style: string): string {
  const styleDescriptions: Record<string, string> = {
    cinematic: "Transform this into a cinematic masterpiece with dramatic lighting, rich colors, film-like color grading, and professional Hollywood-style composition",
    energetic: "Make this vibrant and dynamic with saturated colors, high contrast, and an exciting, attention-grabbing look",
    calm: "Create a peaceful, zen-like atmosphere with soft dreamy colors, gentle lighting, and a meditative feel",
    professional: "Enhance this with clean, sleek corporate styling, modern color grading, and sophisticated business-appropriate aesthetics",
    playful: "Make this fun and engaging with bright cheerful colors, playful composition, and joyful celebratory atmosphere",
    dramatic: "Create an epic impactful look with high contrast, moody color grading, and blockbuster movie poster style",
  };

  const styleDesc = styleDescriptions[style] || styleDescriptions.cinematic;
  
  let prompt = `${styleDesc}.

Create a stunning, scroll-stopping visual for "${title}".
${description ? `Context: ${description}` : ''}

Requirements:
- Ultra high quality with crisp details
- Perfect exposure and professional lighting
- Optimized for ${platform} social media
- Make it premium, polished and engaging
- Keep the main subject clearly visible`;
  
  return prompt;
}