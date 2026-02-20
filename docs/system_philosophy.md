# **Tartami — System Philosophy**

Tartami is a premium, Somali‑rooted, approval‑based auction platform built for trust, privacy, and cultural authenticity.  
The system is intentionally **deterministic**, **database‑first**, and **financially strict**.  
Nothing affecting money, fairness, or trust is ever left to the frontend.

---

# **What I Am Building**

Tartami is not a marketplace.  
It is a **curated auction house** built on:

- Controlled access  
- Financial correctness  
- Identity protection  
- Administrative accountability  
- Cultural authenticity  
- Deterministic behavior  
- Database‑first truth  

If something affects money or fairness, it **must** live in the database.

---

# **Five Pillars of the System**

## **1. Trust**
Every rule must be predictable, explainable, and enforceable.

## **2. Privacy**
Identity masking is a first‑class feature, not an afterthought.

## **3. Financial Integrity**
All financial data is append‑only and immutable.

## **4. Cultural Authenticity**
The system reflects Somali auction norms: fairness, clarity, and respect.

## **5. Determinism**
The database is the single source of truth.  
If I ever feel tempted to “just handle it in the UI,” I stop.

---

# **Core System Invariants (Non‑Negotiable Rules)**

These rules cannot be broken under any circumstances.

---

## **Financial Invariants**
- Hammer price = highest valid bid at auction close  
- Hammer price cannot change after auction ends  
- All financial amounts are immutable  
- Invoices are append‑only  
- Payments are append‑only  
- Adjustments are additive rows, never edits  
- No deletion of financial records  
- No modification of hammer prices  
- No modification of invoice totals after creation  

---

## **Auction Invariants**
- Bids are increment‑only  
- No self‑bidding  
- Only approved bidders may bid  
- Auction statuses flow forward only:  
  `draft → scheduled → live → ended → settled`  
- Ended auctions cannot reopen  
- Soft‑close extensions cannot be reversed  

---

## **Identity Invariants**
- Admin sees full identity  
- Consignors see masked bidders  
- Bidders see masked competitors  
- Masking is stable within an auction  
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
- Admin actions are logged  
- Admin cannot bypass financial logic  
- Admin cannot delete financial records  
- Admin cannot modify hammer prices  
- Admin cannot override RLS boundaries  

---

# **Roles**

## **Bidder**
- Must be approved  
- Can bid  
- Can view own invoices  
- Can toggle masking preference  

## **Consignor**
- Submits items  
- Sees masked bidder activity  
- Receives payouts  

## **Admin**
- Approves users  
- Approves item submissions  
- Creates auctions  
- Records payments  
- Adds financial adjustments  
- Cancels unpaid invoices  
- Cannot modify hammer prices  
- Cannot delete financial records  
- Cannot bypass settlement logic  

Admin is powerful — but **bounded**.

---

# **Architecture**

## **Stack**
- Next.js (App Router)  
- Supabase (Auth + Postgres + RLS + Realtime)  
- Vercel (Hosting)

## **Logic Distribution**

### **Database handles:**
- Bid validation  
- Increment enforcement  
- Soft‑close logic  
- Invoice generation  
- Settlement logic  
- Financial calculations  
- RLS enforcement  
- Audit logging  
- Notification triggers  

### **Frontend handles:**
- Rendering  
- Forms  
- Navigation  
- Realtime display  

**Frontend never determines truth.**

---

# **Auction Engine**

## **Statuses**
- draft  
- scheduled  
- live  
- ended  
- settled  

## **Rules**
- Only admins create auctions  
- Each auction defines:
  - commission rate  
  - start time  
  - end time  
  - soft‑close behavior  
- Items assigned after approval  
- Auction cannot be edited once live  
- Auction cannot be reopened once ended  

---

# **Bidding Engine**

## **Rules**
- Increment‑only bidding  
- No self‑bidding  
- Approved users only  
- Soft‑close enabled  
- DB‑validated transactions  
- Realtime is optional, not authoritative  

## **Soft Close**
- Default extension window: 2 minutes  
- If a valid bid occurs within final 2 minutes → extend by 2 minutes  
- Maximum extension cap: initially unlimited  

## **Simultaneous Bids**
- Resolved inside DB transaction  
- Highest valid committed bid wins  
- No frontend race handling  

---

# **Identity Masking**

- Users can toggle “Mask Identity”  
- Masking is stable per auction  
- Masking differs between auctions  
- Admin always sees real identity  
- Consignors always see masked identity  
- Masking enhances trust without chaos  

---

# **Invoice System**

## **Rules**
- One invoice per auction per bidder  
- Multiple wins → single invoice with multiple line items  
- Invoice generation runs when auction transitions from live → ended  
- Implemented as an idempotent DB function  

## **Requirements**
- Idempotent  
- Transaction‑wrapped  
- Prevent duplicate invoices  
- Frontend does not generate invoices  

---

# **Adjustments**

- Invoices are immutable  
- Corrections are additive adjustments  
- Example: item invalidated → negative adjustment  
- Audit log records adjustment  
- No editing or deleting original line items  

---

# **Payment System**

- Payments are offline  
- Admin records payment manually  
- Invoice marked paid when:  
  `sum(payments) ≥ invoice.total`  
- Wrong payment → reversal entry  
- No deletion allowed  

---

# **Settlement Logic**

- Settlement is per invoice  
- Conditions:
  - Invoice paid  
  - No disputes pending  
- If bidder disappears:
  - Admin cancels invoice  
  - Item moves to next auction  
  - Items held max 7 days  
- Settlement never blocked by unrelated invoices  

---

# **Failure & Recovery Plan**

### **If bid RPC fails**
- User retries  
- No record created  
- DB is authority  

### **If realtime disconnects**
- UI reconnects  
- Data re-fetched  

### **If auction end time passes but status not updated**
- Scheduled DB function updates status  

### **If invoice generation runs twice**
- Function detects existing invoices  
- Must be idempotent  

### **If admin marks wrong invoice paid**
- Reversal entry added  
- Audit log records it  

---

# **Security & RLS**

- All tables have RLS enabled  
- Default: no access  

### **Users**
- Can read/write only allowed rows  

### **Admins**
- Access bounded by app role  
- Cannot bypass RLS  
- Cannot impersonate users  

### **Audit logs required for:**
- Invoice adjustments  
- Payment recordings  
- Invoice cancellations  
- Auction status changes  
- Admin approvals  

Production DB must not expose superuser role.

---

# **Build Order**

1. Auth + user_profiles + RLS  
2. Auctions + items  
3. Bidding RPC (strict DB logic)  
4. Soft close logic  
5. Invoice generation function  
6. Payment system  
7. Settlement system  
8. Masking system  
9. Admin tools  
10. Realtime polish  
11. Production hardening  

**Engine first. UI second.**

---

# **Known Unknowns**

- 2 min vs 5 min soft close  
- Unlimited vs capped extensions  
- Psychological effect of masking  
- Real‑world invoice cancellation frequency  
- Performance under high bid volume  

These will be tested with real usage before overengineering.

---

# **Final Internal Note**

This system is serious.  
If I enforce:

- DB‑first financial logic  
- Idempotent invoice creation  
- Append‑only financial records  
- Clear admin boundaries  
- Strict invariants  

Then Tartami will be stable.

If I cut corners in those areas, it will break under real usage.

**Build it correctly the first time.**

---
