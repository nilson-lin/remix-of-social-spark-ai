-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-uploads', 'video-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for video-uploads bucket
CREATE POLICY "Users can upload their own video images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own video images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'video-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own video images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view video-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-uploads');

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  duration INTEGER DEFAULT 5,
  aspect_ratio TEXT DEFAULT '9:16',
  platform TEXT DEFAULT 'reels',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for videos
CREATE POLICY "Users can view their own videos"
ON public.videos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos"
ON public.videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
ON public.videos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
ON public.videos FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();