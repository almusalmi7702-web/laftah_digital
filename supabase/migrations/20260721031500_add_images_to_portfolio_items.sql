ALTER TABLE public.portfolio_items
ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

UPDATE public.portfolio_items AS p
SET images = COALESCE(
  (
    SELECT array_agg(items.image_url ORDER BY items.sort_order)
    FROM (
      SELECT
        combined.image_url,
        MIN(combined.sort_order) AS sort_order
      FROM (
        SELECT
          p.thumbnail_url AS image_url,
          -1 AS sort_order
        WHERE p.thumbnail_url IS NOT NULL
          AND BTRIM(p.thumbnail_url) <> ''

        UNION ALL

        SELECT
          pi.image_url,
          COALESCE(pi.sort_order, 0)
        FROM public.portfolio_images AS pi
        WHERE pi.portfolio_id = p.id
          AND pi.image_url IS NOT NULL
          AND BTRIM(pi.image_url) <> ''
      ) AS combined
      GROUP BY combined.image_url
    ) AS items
  ),
  '{}'::TEXT[]
)
WHERE COALESCE(array_length(p.images, 1), 0) = 0;
