import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, title, description, sourceImages, duration, aspectRatio, platform } = await req.json();

    console.log("Generate video request:", { videoId, title, platform, duration, aspectRatio });
    console.log("Source images:", sourceImages);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build prompt for video generation
    const prompt = buildVideoPrompt(title, description, platform, aspectRatio);
    console.log("Video prompt:", prompt);

    // Use the first image as the starting frame
    const startingImage = sourceImages[0];
    
    // Generate video using Lovable AI with image-to-video
    console.log("Calling Lovable AI for video generation...");
    
    const videoResponse = await fetch("https://ai.gateway.lovable.dev/v1/video/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        starting_frame: startingImage,
        duration: duration,
        aspect_ratio: aspectRatio,
        resolution: "1080p",
      }),
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error("Video generation error:", videoResponse.status, errorText);
      
      if (videoResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (videoResponse.status === 402) {
        throw new Error("Insufficient credits. Please add credits to continue.");
      }
      
      throw new Error(`Video generation failed: ${errorText}`);
    }

    const videoResult = await videoResponse.json();
    console.log("Video generation result:", JSON.stringify(videoResult).substring(0, 200));

    // Extract video URL from response
    const videoUrl = videoResult.video_url || videoResult.data?.video_url || null;
    const thumbnailUrl = sourceImages[0]; // Use first image as thumbnail

    // Update video record
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: videoUrl ? "completed" : "failed",
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
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-video function:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildVideoPrompt(title: string, description: string, platform: string, aspectRatio: string): string {
  const platformDescriptions: Record<string, string> = {
    reels: "Instagram Reels vertical video",
    tiktok: "TikTok vertical short-form video",
    youtube_shorts: "YouTube Shorts vertical video",
    feed: "Instagram feed square video",
    landscape: "YouTube/Facebook landscape video",
  };

  const platformDesc = platformDescriptions[platform] || "social media video";
  
  let prompt = `Create a dynamic ${platformDesc} with ${aspectRatio} aspect ratio. `;
  prompt += `Title: ${title}. `;
  
  if (description) {
    prompt += `Description: ${description}. `;
  }
  
  prompt += "The video should be engaging, professional, with smooth transitions and modern visual effects. ";
  prompt += "Add subtle motion to the image, like zoom effects, parallax, or gentle panning. ";
  prompt += "Make it visually appealing for social media with vibrant colors and attention-grabbing movement.";
  
  return prompt;
}
