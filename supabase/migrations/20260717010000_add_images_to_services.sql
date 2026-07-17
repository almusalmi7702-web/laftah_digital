ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

UPDATE public.services
SET images = ARRAY[thumbnail_url]
WHERE thumbnail_url IS NOT NULL
  AND COALESCE(array_length(images, 1), 0) = 0;
