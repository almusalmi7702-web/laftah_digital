# Vercel Environment Variables

The same-origin public API (`/api/public`) requires these server-side environment variables in Vercel:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | The Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | The Supabase anon/public key — NOT the service role key |

## Notes

- These are the same values already used by the frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), but the API reads them without the `VITE_` prefix so they stay server-side only.
- **Never** use `SUPABASE_SERVICE_ROLE_KEY` in the API or frontend.
- The API function creates a short-lived Supabase client per invocation (no session persistence).
- No keys are logged or exposed to the client.
- Cache headers (`s-maxage=60, stale-while-revalidate=86400`) are set on API responses for CDN caching.
