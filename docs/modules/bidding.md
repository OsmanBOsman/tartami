# 🎯 **Bidding Module**

The Bidding module implements Tartami’s **increment‑only**, **approval‑based**, **soft‑close‑protected** bidding engine.  
This is one of the most critical modules in the entire system because it directly affects fairness, trust, and financial correctness.

---

## 🗄️ **Tables**

### **bids**
Stores every bid placed on an item.

Fields include:

- `id`
- `item_id`
- `auction_id`
- `bidder_id`
- `amount`
- `created_at`
- `is_valid` (future: for invalidation audits)
- `masked_label` (stable per auction)

---

## ⭐ **Core Rules**

### **1. Increment‑Only Bidding**
- No proxy bids  
- No auto‑bids  
- No custom amounts  
- All increments enforced by DB logic  
- Increments come from the increment table (already defined in your system)

### **2. No Self‑Bidding**
- A consignor cannot bid on their own item  
- Enforced in the `place_bid` RPC

### **3. Bidder Must Be Approved**
- `user_profiles.is_approved = true`  
- Enforced in RLS + RPC

### **4. Soft‑Close Extension**
Default behavior:

- If a valid bid occurs within the final **2 minutes**  
  → extend auction end time by **2 minutes**

Notes:

- Extensions are handled **inside the DB transaction**  
- Extensions cannot be reversed  
- Maximum extension cap = unlimited (for now)

### **5. Realtime Updates**
- Supabase Realtime broadcasts new bids  
- UI updates instantly  
- Realtime is **not authoritative**  
- If realtime fails, UI re-fetches from DB

---

## 🔄 **Flow**

### **1. User places a bid**
- Calls `place_bid` RPC  
- RPC validates:
  - approval  
  - increment  
  - auction status  
  - self‑bidding  
  - soft‑close  
- Bid is inserted  
- Realtime broadcast fires  

### **2. UI updates**
- Realtime updates bid list  
- Masked identities shown  
- Countdown updates  

### **3. Auction ends**
- Highest valid bid becomes hammer price  
- Invoice generation runs in the next module  

---

## 🧭 **Pages**

### **/auctions/[id]/items/[itemId]**
- Item detail  
- Bid history (masked)  
- Bid input  
- Realtime updates  
- Soft‑close countdown  

### **/admin/bids**
- Admin view of all bids  
- Full identity  
- Filters by auction, item, bidder  
- Read‑only (admins cannot modify bids)

---

## 🔐 **RLS Rules**

### **Bidder**
- `insert` only if:
  - approved  
  - auction is live  
  - increment is valid  
- `select` masked bids for visible auctions

### **Consignor**
- `select` masked bids on their own items  
- Never sees bidder identity

### **Admin**
- Full identity access  
- `select` all bids  
- Cannot modify or delete bids  
- Cannot override increment logic  

### **Public**
- No access

---

## 🧱 **Module Dependencies**

### **Depends on:**
- Users module (approval + identity)
- Items module (item ownership)
- Auctions module (auction status)

### **Required before:**
- Invoices module  
- Payments module  
- Settlement module  

Because bidding determines:

- hammer price  
- invoice totals  
- consignor payouts  

---

## 🛠 **Implementation Notes**

- `place_bid` RPC must be **transaction‑wrapped**  
- Soft‑close logic must run inside the same transaction  
- Realtime is optional; DB is the authority  
- Masking label generated per auction per user  
- Admin view must never expose masked identities  

---
