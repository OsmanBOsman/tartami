# 🏗️ **Tartami — System Architecture (Updated, Mask‑Free)**

Tartami is a **Postgres‑first**, **RLS‑enforced**, **append‑only**, and **audit‑driven** auction system.  
The architecture is intentionally simple, deterministic, and built to protect **trust**, **transparency**, and **financial correctness**.

The database is the **authoritative layer**.  
The frontend is the **interface layer**.  
Nothing affecting money, fairness, or identity is ever left to the UI.

---

# **1. Domains**

| Domain | Purpose |
|--------|---------|
| **tartami.app** | Marketing site (static, public, multilingual in future) |
| **app.tartami.app** | Application (auth, auctions, bidding, invoices, payouts, admin) |

The marketing site is static and safe.  
The application domain is fully protected by Auth + RLS.

---

# **2. Tech Stack**

## **Frontend**
- Next.js App Router  
- Server Actions  
- React Server Components  
- Client components for realtime UI  

## **Backend**
- Supabase Auth  
- Supabase Postgres  
- Supabase RLS  
- Supabase Realtime  
- Supabase Storage (images)  

## **Hosting**
- Vercel for frontend  
- Supabase for backend  

This stack is intentionally minimal, modern, and maintainable for a solo developer.

---

# **3. Logic Distribution**

Tartami follows a strict separation of concerns:

---

## **Database (Authoritative Layer)**  
All critical logic lives in Postgres:

- bid validation  
- increment enforcement  
- soft‑close logic  
- auction status transitions  
- invoice generation  
- settlement logic  
- payout calculation  
- financial calculations  
- RLS enforcement  
- audit logging  
- notification triggers  

**If it affects money or fairness, it belongs in the database.**

---

## **Frontend (Interface Layer)**  
The frontend is intentionally thin:

- UI rendering  
- forms  
- navigation  
- realtime display  
- optimistic UI (optional)  
- user interactions  

The frontend **never** determines truth.  
It only displays what the database has already validated.

---

# **4. Realtime Model**

Tartami uses realtime for **speed**, not **truth**.

- Supabase Realtime broadcasts new bids  
- UI updates instantly  
- If connection drops → UI re-fetches authoritative data  
- Realtime is optional  
- Database transactions decide winners, not the websocket  

This ensures fairness even under high load.

---

# **5. Module Boundaries**

Each module is isolated and self‑contained:

- **Users & Profiles**  
- **Auctions**  
- **Items**  
- **Bidding**  
- **Invoices**  
- **Payments**  
- **Settlement**  
- **Payouts**  
- **Notifications**  
- **Admin Console**

Each module includes:

- tables  
- RLS policies  
- RPC functions  
- triggers  
- server actions  
- UI pages  

This modularity keeps the system maintainable and future‑proof.

---

# **6. Security Model**

Tartami enforces a strict security posture:

- **Full RLS** on every table  
- **Default deny**  
- **Explicit allow** per role  
- **Admins are powerful but bounded**  
- **No superuser exposed to the app**  
- **All admin actions logged**  
- **All financial tables append‑only**  

Security is not optional — it is foundational.

---

# **7. Deployment Model**

## **Frontend**
- Deployed on Vercel  
- Uses environment variables to connect to Supabase  
- Server Actions call RPCs securely  

## **Backend**
Supabase hosts:

- Postgres  
- Auth  
- RLS  
- Realtime  
- Storage  
- Edge Functions (future optional)  

## **Environment Separation**
- `dev` → local Supabase  
- `staging` → optional  
- `prod` → locked down, no superuser  

---

# **8. Architectural Philosophy**

Tartami’s architecture is built on three principles:

---

## **1. Database‑First**
All important logic lives in Postgres:

- correctness  
- fairness  
- financial integrity  
- identity clarity  
- auditability  

---

## **2. Deterministic Behavior**
Every outcome must be:

- predictable  
- explainable  
- reproducible  

No randomness.  
No hidden logic.  
No UI‑based decisions.

---

## **3. Append‑Only Financial Model**
Financial correctness is enforced by:

- no deletes  
- no updates to totals  
- no updates to payouts  
- adjustments as additive entries  
- audit logs for every admin action  

This protects trust and prevents corruption.

---

# **9. High‑Level Flow**

### **1. User signs up → profile created → admin approves**  
### **2. Admin creates auction → assigns items**  
### **3. Auction goes live → bidders place increment‑only bids**  
### **4. Soft‑close extends auction if needed**  
### **5. Auction ends → invoices generated**  
### **6. Admin records payments**  
### **7. All invoices paid → settlement runs**  
### **8. Payouts created → admin marks as paid**  
### **9. Notifications sent throughout**  

Every step is deterministic and database‑driven.

---

# **10. Future‑Proofing**

The architecture supports:

- multilingual expansion  
- mobile apps  
- additional auction types  
- escrow or online payments (future)  
- analytics dashboards  
- AI‑assisted admin tools  
- event replay from audit logs  

The foundation is strong enough to evolve for years.

---
