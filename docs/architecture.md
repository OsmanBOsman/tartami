# 🏗️ Tartami — System Architecture

## 🌐 Domains
- **tartami.app** — marketing (static, public)  
- **app.tartami.app** — application (auth, RLS, auctions, bidding, admin)

## ⚙️ Tech Stack
- Next.js App Router (SSR + client components)  
- Supabase (Auth, Postgres, RLS, Realtime, Storage)  
- Vercel (hosting)

## 🧠 Logic Distribution

### **Database (Authoritative Layer)**
Handles:
- Bid validation  
- Increment enforcement  
- Soft‑close logic  
- Auction status transitions  
- Invoice generation  
- Settlement logic  
- Financial calculations  
- RLS enforcement  
- Audit logging  
- Notification triggers  

**If it affects money or fairness, it lives in the database.**

### **Frontend (Interface Layer)**
Handles:
- UI  
- Forms  
- Masking  
- Navigation  
- Realtime display  
- User interactions  

Frontend **never** determines truth.

## 🔔 Realtime Model
- Supabase Realtime for bids  
- Optional realtime notifications  
- Realtime is not authoritative  
- UI re-fetches if connection drops  

## 🧩 Module Boundaries
- Users & Profiles  
- Auctions  
- Items  
- Bidding  
- Invoices  
- Payments  
- Settlement  
- Notifications  
- Admin Console  

Each module has:
- Tables  
- RLS  
- RPC functions  
- Triggers  
- UI pages  
- Server actions  

## 🔐 Security Model
- Full RLS  
- Default deny  
- Admins bounded by invariants  
- No superuser exposed  
- All admin actions logged  

## 🧱 Deployment Model
- Vercel deploys Next.js  
- Supabase hosts DB  
- Environment variables connect them  

---
