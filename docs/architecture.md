System Architecture
Domains
tartami.app → marketing (static, public)
app.tartami.app → application (auth, RLS, auctions, bidding, admin)
Stack
Next.js App Router (SSR + client components)
Supabase (Auth, Postgres, RLS, Realtime, Storage)
Vercel (hosting)
Where Logic Lives
Database (authoritative):
Bid validation
Increment enforcement
Soft close
Invoice generation
Settlement
RLS
Frontend:
UI
Forms
Masking
Navigation
Realtime
Supabase Realtime on bids
Optional realtime notifications
