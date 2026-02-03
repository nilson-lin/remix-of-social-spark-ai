import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POLLO_API_URL = "https://pollo.ai/api/platform/generation/google/veo3-fast";

// Build video prompt based on style and content
function buildVideoPrompt(title: string, description: string, style: string): string {
  const styleDescriptions: Record<string, string> = {
    cinematic: "Cinematic video with dramatic lighting, smooth camera movements, film-like color grading, and professional Hollywood-style composition. Rich contrast and depth.",
    energetic: "Dynamic and vibrant video with fast-paced energy, saturated colors, quick transitions, and exciting movement. High energy atmosphere.",
    calm: "Peaceful and zen-like video with slow, gentle movements, soft pastel colors, smooth transitions, and meditative atmosphere.",
    professional: "Clean and polished corporate video with sleek modern aesthetics, professional lighting, and sophisticated business-appropriate style.",
    playful: "Fun and engaging video with bright cheerful colors, bouncy movements, playful animations, and joyful celebratory atmosphere.",
    dramatic: "Epic and impactful video with high contrast, moody lighting, intense movements, and blockbuster movie style visuals.",
  };

  const styleDesc = styleDescriptions[style] || styleDescriptions.cinematic;
  
  return `Create a stunning social media video for: "${title}". ${description ? `Context: ${description}.` : ''} Style: ${styleDesc}. Make it scroll-stopping, visually captivating, and perfect for social media engagement. Smooth camera motion, professional quality.`;
}

// Get aspect ratio config based on platform
function getAspectRatioConfig(platform: string): { aspectRatio: string; resolution: string } {
  const configs: Record<string, { aspectRatio: string; resolution: string }> = {
    reels: { aspectRatio: "9:16", resolution: "720p" },
    tiktok: { aspectRatio: "9:16", resolution: "720p" },
    stories: { aspectRatio: "9:16", resolution: "720p" },
    youtube: { aspectRatio: "16:9", resolution: "720p" },
    feed: { aspectRatio: "1:1", resolution: "720p" },
  };
  
  return configs[platform] || configs.reels;
}

// Poll for video generation status
async function pollForCompletion(
  generationId: string,
  apiKey: string,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<{ videoUrl: string; thumbnailUrl?: string } | null> {
  console.log(`Polling for generation ${generationId}...`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://pollo.ai/api/platform/generation/${generationId}`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Poll attempt ${attempt + 1} failed:`, response.status);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }

      const result = await response.json();
      console.log(`Poll attempt ${attempt + 1}, status:`, result.status);

      if (result.status === "completed" && result.output?.videoUrl) {
        return {
          videoUrl: result.output.videoUrl,
          thumbnailUrl: result.output.thumbnailUrl || result.output.videoUrl,
        };
      }

      if (result.status === "failed") {
        console.error("Video generation failed:", result.error);
        return null;
      }

      // Still processing, wait and try again
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Poll attempt ${attempt + 1} error:`, error);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.error("Polling timed out");
  return null;
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

    const POLLO_API_KEY = Deno.env.get("POLLO_API_KEY");
    if (!POLLO_API_KEY) {
      throw new Error("POLLO_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build prompt for video generation
    const prompt = buildVideoPrompt(title, description ?? "", style || "cinematic");
    const { aspectRatio, resolution } = getAspectRatioConfig(platform ?? "reels");
    
    console.log("Video prompt:", prompt);
    console.log("Aspect ratio:", aspectRatio, "Resolution:", resolution);

    // Use the first image as the source for image-to-video
    const sourceImage = sourceImages[0];

    // Call Pollo.ai Veo3 API
    console.log("Calling Pollo.ai Veo3 API...");

    const polloResponse = await fetch(POLLO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": POLLO_API_KEY,
      },
      body: JSON.stringify({
        input: {
          image: sourceImage,
          prompt: prompt,
          negativePrompt: "blurry, low quality, distorted, ugly, bad composition, amateur, watermark, text overlay",
          length: 8,
          aspectRatio: aspectRatio,
          resolution: resolution,
          generateAudio: false,
        },
      }),
    });

    if (!polloResponse.ok) {
      const errorText = await polloResponse.text();
      console.error("Pollo.ai API error:", polloResponse.status, errorText);
      throw new Error(`Pollo.ai API error: ${polloResponse.status} - ${errorText}`);
    }

    const polloResult = await polloResponse.json();
    console.log("Pollo.ai response:", JSON.stringify(polloResult).substring(0, 500));

    // Check if we got an immediate result or need to poll
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = sourceImages[0];

    if (polloResult.output?.videoUrl) {
      // Immediate result
      videoUrl = polloResult.output.videoUrl;
      thumbnailUrl = polloResult.output.thumbnailUrl || sourceImages[0];
      console.log("Got immediate video URL:", videoUrl);
    } else if (polloResult.id || polloResult.generationId) {
      // Need to poll for result
      const generationId = polloResult.id || polloResult.generationId;
      console.log("Got generation ID, polling for result:", generationId);
      
      const pollResult = await pollForCompletion(generationId, POLLO_API_KEY);
      
      if (pollResult) {
        videoUrl = pollResult.videoUrl;
        thumbnailUrl = pollResult.thumbnailUrl || sourceImages[0];
      }
    }

    if (!videoUrl) {
      throw new Error("Failed to generate video: no video URL returned");
    }

    console.log("Final video URL:", videoUrl);

    // Update video record with the generated video URL
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId);

    if (updateError) {
      console.error("Error updating video:", updateError);
      throw updateError;
    }

    console.log("Video generation completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        videoUrl,
        thumbnailUrl,
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
