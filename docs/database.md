# 🗄️ **Tartami — Database Schema Overview**

Tartami uses a **Postgres‑first**, **RLS‑enforced**, **append‑only**, and **audit‑driven** schema.  
The database is the **single source of truth** for all identity, auction, bidding, and financial logic.  
Every module in Tartami is built on top of this schema.

This document provides a **human‑readable overview** of the schema before implementation in `schema.sql`.

---

# **1. Tables Overview**

Below is a high‑level summary of every core table in the system.

---

## **1. `user_profiles`**
Stores all user‑level metadata.

- identity  
- approval status  
- admin flag  
- masking preference  
- contact info  

Created automatically via trigger on `auth.users`.

---

## **2. `auctions`**
Defines auction‑level configuration.

- metadata  
- commission rate  
- start/end times  
- soft‑close window  
- status transitions (`draft → scheduled → live → ended → settled`)  

---

## **3. `items`**
Represents approved items ready for auction.

- item details  
- consignor reference  
- auction assignment  
- approval status  
- immutable starting_bid  

---

## **4. `item_submissions`**
Raw submissions from consignors.

- pending → approved/rejected  
- admin review workflow  
- rejection reasons  
- conversion into `items`  

---

## **5. `bids`**
Stores every bid placed on an item.

- increment‑only enforcement  
- bidder identity  
- masked identity label  
- soft‑close triggers  
- append‑only  

---

## **6. `invoices`**
One invoice per bidder per auction.

- immutable totals  
- buyer premium applied  
- multiple line items  
- append‑only adjustments  
- status: `unpaid`, `paid`, `cancelled`  

---

## **7. `payments`**
Offline payments recorded by admins.

- cash / transfer / mobile money  
- append‑only  
- reversals = negative entries  
- no deletes  

---

## **8. `consignor_payouts`**
Settlement results per item.

- hammer price  
- commission rate  
- payout amount  
- immutable once created  
- status: `pending`, `paid`  

---

## **9. `notifications`**
User‑level alerts.

- outbid  
- auction live  
- invoice ready  
- payout ready  
- admin alerts  

Append‑only, never authoritative.

---

## **10. `audit_logs`**
Immutable record of all admin actions.

- approvals  
- rejections  
- payments  
- adjustments  
- cancellations  
- settlement actions  
- auction status changes  

Append‑only, trigger‑driven.

---

# **2. Key Relationships**

A simplified view of the relational structure:

---

## **auction → items**
One auction contains many items.

```
auctions.id → items.auction_id
```

---

## **item → bids**
One item receives many bids.

```
items.id → bids.item_id
```

---

## **auction + bidder → invoice**
One invoice per bidder per auction.

```
invoices.auction_id + invoices.bidder_id = unique
```

---

## **invoice → payments**
Payments accumulate until invoice is fully paid.

```
invoices.id → payments.invoice_id
```

---

## **item → consignor_payouts**
Each sold item generates a payout after settlement.

```
items.id → consignor_payouts.item_id
```

---

# **3. Schema Invariants**

These rules **cannot be broken**.

---

## **Identity Invariants**
- Every user must have a `user_profiles` row  
- Approval required for bidding  
- Masking never affects admin visibility  

---

## **Auction Invariants**
- Auctions cannot be reopened after ending  
- Commission rate locked once auction is live  
- Soft‑close logic enforced in DB  

---

## **Bidding Invariants**
- Increment‑only  
- No proxy bids  
- No auto‑bids  
- No custom amounts  
- No self‑bidding  
- Append‑only  

---

## **Invoice Invariants**
- One invoice per bidder per auction  
- Totals immutable  
- No deletes  
- Adjustments append‑only  

---

## **Payment Invariants**
- Offline only  
- Append‑only  
- Reversals = negative entries  
- No deletes  

---

## **Settlement & Payout Invariants**
- Settlement only when all invoices are paid  
- Payout amounts immutable  
- Append‑only  
- Admin cannot modify payout amounts  

---

## **Notification Invariants**
- Append‑only  
- Never authoritative  
- Metadata required  

---

## **Audit Log Invariants**
- Append‑only  
- Immutable  
- Trigger‑generated  

---

# **4. Schema Philosophy**

Tartami’s schema is built on four core principles:

---

## **1. Postgres‑First**
All business logic lives in:

- tables  
- constraints  
- triggers  
- RPCs  
- RLS policies  

The database is the authority.

---

## **2. RLS Everywhere**
Every table has:

- RLS enabled  
- default deny  
- explicit allow policies  

No exceptions.

---

## **3. Append‑Only Financial Model**
Financial correctness is enforced by:

- no deletes  
- no updates to totals  
- no updates to payouts  
- adjustments as additive entries  

---

## **4. Auditability**
Every sensitive action is logged:

- approvals  
- payments  
- cancellations  
- settlement  
- admin actions  

Audit logs are immutable.

---

# **5. Implementation Notes**

- Schema defined in `schema.sql`  
- RLS policies defined in `rls.sql`  
- RPCs defined in `functions.sql`  
- Triggers defined in `triggers.sql`  
- All financial logic must run inside transactions  
- All admin actions must write to `audit_logs`  
- No frontend calculation of financial amounts  
- Masking logic applied at UI layer only  

---
