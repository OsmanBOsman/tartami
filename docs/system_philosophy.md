# 🌍 **Tartami — System Philosophy**

Tartami is a premium, Somali‑rooted, approval‑based auction platform built for **trust**, **privacy**, and **financial correctness**.  
The system is intentionally **deterministic**, **database‑first**, and **strictly governed by invariants**.  
Nothing affecting money, fairness, or identity is ever left to the frontend.

Tartami behaves like a real auction house: predictable, auditable, and culturally authentic.

---

# **1. What Tartami Is**

Tartami is **not** a marketplace.  
It is a **curated auction house**, built on:

- controlled access  
- financial integrity  
- identity protection  
- administrative accountability  
- Somali cultural expectations  
- deterministic behavior  
- Postgres‑first truth  

If something affects money or fairness, it **must** live in the database.

---

# **2. Core Principles**

These principles guide every module, every RPC, every policy, and every decision.

---

## **1. Trust**
Rules must be predictable, explainable, and enforced by the database — not the UI.

## **2. Privacy**
Identity masking is a first‑class feature.  
Users control their visibility; admins always see truth.

## **3. Financial Integrity**
All financial data is **append‑only**, **immutable**, and **transaction‑wrapped**.

## **4. Cultural Authenticity**
The system reflects Somali auction norms:  
fairness, clarity, respect, and competitive spirit.

## **5. Determinism**
The database is the single source of truth.  
If logic is important, it belongs in Postgres.

---

# **3. System Invariants (Non‑Negotiable Rules)**

These rules **cannot be broken** under any circumstances.  
They define Tartami’s identity and protect its integrity.

---

## **Financial Invariants**
- Hammer price = highest valid bid at auction close  
- Hammer price is immutable after auction ends  
- All financial amounts are immutable  
- Invoices are append‑only  
- Payments are append‑only  
- Adjustments are additive rows  
- No deletion of financial records  
- No modification of invoice totals  
- No modification of payout amounts  

---

## **Auction Invariants**
- Bids are increment‑only  
- No self‑bidding  
- Only approved bidders may bid  
- Statuses flow forward only:  
  `draft → scheduled → live → ended → settled`  
- Ended auctions cannot reopen  
- Soft‑close extensions cannot be reversed  
- Auction cannot be edited once live  

---

## **Identity Invariants**
- Admin sees full identity  
- Consignors see masked bidders  
- Bidders see masked competitors  
- Masking is stable per auction  
- Masking differs between auctions  
- Masking preference is user‑controlled  

---

## **Settlement Invariants**
- No payout before invoice is fully paid  
- Settlement is per invoice, not per auction  
- Cancelled invoices must log a reason  
- Payout amounts are immutable once created  

---

## **Administrative Invariants**
- All admin actions are logged  
- Admin cannot bypass financial logic  
- Admin cannot delete financial records  
- Admin cannot modify hammer prices  
- Admin cannot override RLS boundaries  
- Admin is powerful — but **bounded**  

---

# **4. Roles**

## **Bidder**
- Must be approved  
- Can bid  
- Can view own invoices  
- Can toggle masking  

## **Consignor**
- Submits items  
- Sees masked bidder activity  
- Receives payouts  

## **Admin**
- Approves users  
- Approves item submissions  
- Creates auctions  
- Records payments  
- Adds adjustments  
- Cancels unpaid invoices  
- Marks payouts as paid  
- Cannot modify hammer prices  
- Cannot delete financial records  
- Cannot bypass settlement logic  

---

# **5. Architecture Philosophy**

## **Stack**
- Next.js (App Router)  
- Supabase (Auth + Postgres + RLS + Realtime)  
- Vercel (Hosting)

---

## **Database Handles**
- bid validation  
- increment enforcement  
- soft‑close logic  
- invoice generation  
- settlement logic  
- financial calculations  
- RLS enforcement  
- audit logging  
- notification triggers  

## **Frontend Handles**
- rendering  
- forms  
- navigation  
- realtime display  

**Frontend never determines truth.**

---

# **6. Auction Engine Philosophy**

## **Statuses**
- draft  
- scheduled  
- live  
- ended  
- settled  

## **Rules**
- Only admins create auctions  
- Commission rate locked once live  
- Items assigned after approval  
- Auction cannot be edited once live  
- Auction cannot be reopened once ended  

---

# **7. Bidding Engine Philosophy**

## **Rules**
- increment‑only  
- no self‑bidding  
- approved users only  
- soft‑close enabled  
- DB‑validated transactions  
- realtime optional, not authoritative  

## **Soft Close**
- default window: 2 minutes  
- bid inside window → extend by 2 minutes  
- no maximum extension cap (initially)  

## **Simultaneous Bids**
- resolved inside DB transaction  
- highest valid committed bid wins  

---

# **8. Identity Masking Philosophy**

- user‑controlled  
- stable per auction  
- different across auctions  
- admin always sees real identity  
- consignor always sees masked identity  
- masking enhances trust without chaos  

---

# **9. Invoice Philosophy**

- one invoice per bidder per auction  
- multiple wins → single invoice  
- generated when auction ends  
- implemented as idempotent RPC  
- frontend never generates invoices  

---

# **10. Adjustments Philosophy**

- invoices are immutable  
- corrections = additive adjustments  
- negative adjustments allowed  
- audit logs required  

---

# **11. Payment Philosophy**

- offline only  
- admin‑recorded  
- invoice paid when:  
  `sum(payments) ≥ invoice.total`  
- wrong payment → reversal entry  
- no deletion allowed  

---

# **12. Settlement Philosophy**

- settlement is per invoice  
- invoice must be fully paid  
- cancelled invoices must log a reason  
- payout amounts immutable  
- admin cannot modify payouts  

---

# **13. Failure & Recovery Philosophy**

- bid RPC failure → retry safe  
- realtime failure → UI re-fetch  
- auction status fallback → scheduled DB job  
- invoice generation → idempotent  
- wrong payment → reversal entry  
- admin mistakes → logged, never hidden  

---

# **14. Security & RLS Philosophy**

- RLS enabled on all tables  
- default deny  
- explicit allow  
- admin cannot bypass RLS  
- admin cannot impersonate users  
- audit logs required for all sensitive actions  

Production DB must not expose superuser role.

---

# **15. Build Order**

1. Auth + user_profiles + RLS  
2. Auctions + items  
3. Bidding RPC  
4. Soft‑close logic  
5. Invoice generation  
6. Payment system  
7. Settlement system  
8. Masking system  
9. Admin tools  
10. Realtime polish  
11. Production hardening  

**Engine first. UI second.**

---

# **16. Known Unknowns**

- soft‑close window tuning  
- extension cap behavior  
- masking psychology  
- invoice cancellation frequency  
- high‑volume bidding performance  

These will be validated with real usage.

---

# **17. Final Internal Note**

Tartami is a serious system.  
If I enforce:

- DB‑first financial logic  
- idempotent invoice creation  
- append‑only financial records  
- strict admin boundaries  
- clear invariants  

Then Tartami will be stable, trustworthy, and premium.

If I cut corners, it will break under real usage.

**Build it correctly the first time.**

---
