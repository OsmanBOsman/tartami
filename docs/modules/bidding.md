# 🎯 **Bidding Module**

The Bidding Module implements Tartami’s **increment‑only**, **approval‑based**, **soft‑close‑protected** bidding engine.  
It is one of the most sensitive modules in the entire system because it directly affects fairness, trust, and financial correctness.

All bidding logic is **database‑enforced**, **transaction‑wrapped**, and **idempotent** (safe to retry without creating duplicate bids or duplicate soft‑close extensions).

---

# **1. Table Definitions**

## **bids**
Stores every bid placed on an item.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Bid ID |
| `item_id` | uuid (FK → items.id) | Item being bid on |
| `auction_id` | uuid (FK → auctions.id) | Auction containing the item |
| `bidder_id` | uuid (FK → user_profiles.id) | User placing the bid |
| `amount` | numeric | Bid amount (increment‑only) |
| `created_at` | timestamptz | Timestamp |
| `is_valid` | boolean | Future: invalidation audits |
| `masked_label` | text | Stable masked identity per auction |

**Notes:**
- No updates or deletes allowed  
- All corrections handled via `is_valid = false` (future)  

---

# **2. Core Rules**

## **1. Increment‑Only Bidding**
- No proxy bids  
- No auto‑bids  
- No custom amounts  
- All increments enforced by DB logic  
- Increments come from the **increment table** defined in your system  
- Validation happens inside `place_bid` RPC  

---

## **2. No Self‑Bidding**
- A consignor cannot bid on their own item  
- Enforced inside `place_bid` RPC  
- Also validated in RLS  

---

## **3. Bidder Must Be Approved**
- `user_profiles.is_approved = true`  
- Enforced in:
  - RLS  
  - `place_bid` RPC  

Unapproved users cannot place bids.

---

## **4. Soft‑Close Extension**
Default behavior:

- If a valid bid occurs within the final **X minutes**  
  → extend auction end time by **X minutes**

Where:
- X = `soft_close_window` (default: 2 minutes)

Rules:
- Extensions run **inside the same DB transaction**  
- Extensions must be **atomic**  
- Extensions must be **idempotent** (safe to run multiple times without duplicating the extension)  
- Extensions must be **logged**  
- No maximum extension cap (for now)  

---

## **5. Realtime Updates**
- Supabase Realtime broadcasts new bids  
- UI updates instantly  
- Realtime is **not authoritative**  
- If realtime fails, UI re-fetches from DB  

---

# **3. Bid Placement Workflow**

## **A. User Places a Bid**
User calls:

```
place_bid(item_id, amount)
```

The RPC validates:

1. User is approved  
2. Auction is live  
3. Item belongs to the auction  
4. User is not the consignor  
5. Amount matches increment table  
6. Soft‑close extension rules  
7. No race conditions (transaction‑wrapped)

If valid:
- Bid is inserted  
- Soft‑close extension applied (if needed)  
- Realtime broadcast fires  

---

## **B. UI Updates**
- Realtime updates bid list  
- Masked identities shown  
- Countdown updates  
- If realtime fails → UI re-fetches  

---

## **C. Auction Ends**
- Highest valid bid becomes hammer price  
- Invoice generation runs in the next module  

---

# **4. Invariants**

These rules **cannot be broken**.

### **Bidding Invariants**
- Bids must follow increment table  
- No self‑bidding  
- No bidding outside `live` status  
- No bidding after auction end  
- No custom amounts  
- No proxy or auto‑bidding  

### **Soft‑Close Invariants**
- Extensions must be atomic  
- Extensions must be idempotent (never extend twice for the same bid)  
- Extensions cannot be reversed  

### **Identity Invariants**
- Public sees masked bidder identities  
- Consignors see masked identities  
- Admin sees full identities  

### **Data Invariants**
- Bids are append‑only  
- No updates  
- No deletes  
- Corrections handled via `is_valid = false` (future)  

---

# **5. RLS Rules**

## **Bidder**
Allowed:
- `insert` if:
  - user is approved  
  - auction is live  
  - increment is valid  
  - user is not consignor  

- `select` masked bids for visible auctions  

---

## **Consignor**
Allowed:
- `select` masked bids on their own items  
- Never sees bidder identity  

---

## **Admin**
Allowed:
- `select` all bids  
- Full identity access  

Not allowed:
- modifying bids  
- deleting bids  
- overriding increment logic  

---

## **Public**
- No access  

---

# **6. UI Pages**

### **/auctions/[id]/items/[itemId]**
- Item detail  
- Bid history (masked)  
- Bid input  
- Realtime updates  
- Soft‑close countdown  

### **/admin/bids**
- Full identity  
- Filters by:
  - auction  
  - item  
  - bidder  
- Read‑only  

---

# **7. Failure & Recovery**

### If increment validation fails:
- RPC returns error  
- No partial bid  

### If soft‑close extension fails:
- Entire transaction rolls back  
- Bidder retries  

### If realtime fails:
- UI re-fetches from DB  

### If two bids arrive at the same millisecond:
- Transaction ordering resolves winner  
- Losing bid receives error  

### If RPC is retried:
- Idempotent logic prevents:
  - duplicate bids  
  - duplicate extensions  

---

# **8. Module Dependencies**

### **Depends on:**
- Users (approval + identity)  
- Items (ownership)  
- Auctions (status + soft‑close)  

### **Required before:**
- Invoices  
- Payments  
- Settlement  

Because bidding determines:
- hammer price  
- invoice totals  
- consignor payouts  

---

# **9. Implementation Notes**

- `place_bid` RPC must be **transaction‑wrapped**  
- Soft‑close logic must run inside the same transaction  
- Realtime is optional; DB is the authority  
- Masking label generated per auction per user  
- Admin view must never expose masked identities  
- No manual overrides for bids  

---
