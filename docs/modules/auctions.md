# 🏛️ **Auctions Module**

The Auctions Module defines how auctions are created, scheduled, activated, ended, and settled.  
It is the **central lifecycle engine** that connects items, bidding, invoices, and payouts.

---

## 🗄️ **Tables**

### **auctions**
Stores all auction metadata.

Fields include:

- `id`
- `title`
- `description`
- `commission_rate` (10% or 15%)
- `start_time`
- `end_time`
- `soft_close_window` (default: 2 minutes)
- `status` (draft, scheduled, live, ended, settled)
- `created_at`
- `updated_at`

### **items**
Referenced here because items belong to auctions.

Fields include:

- `id`
- `auction_id`
- `consignor_id`
- `starting_bid`
- `status` (approved, assigned, sold, unsold)

---

## 🔄 **Auction Statuses**

Tartami auctions follow a **forward‑only** lifecycle:

1. **draft**  
   - Created by admin  
   - Editable  

2. **scheduled**  
   - Start/end times set  
   - Visible to public  

3. **live**  
   - Bidding enabled  
   - Soft‑close active  

4. **ended**  
   - Bidding disabled  
   - Hammer prices locked  
   - Invoice generation runs  

5. **settled**  
   - All invoices paid or cancelled  
   - Payouts generated  

Statuses **cannot move backward**.

---

## ⭐ **Core Rules**

### **1. Only Admins Create Auctions**
- Admins define:
  - title  
  - description  
  - commission rate  
  - start/end times  
  - soft‑close window  
- Admins can edit auctions only while in `draft` or `scheduled`

### **2. Items Belong to Auctions**
- Items are assigned by admins  
- Items cannot be reassigned once auction is live  
- Items cannot be removed after auction starts  

### **3. Commission Set at Creation**
- Commission rate is locked once auction becomes `live`  
- Used for:
  - invoice generation  
  - payout calculation  

### **4. Soft‑Close Logic**
- If a valid bid occurs within the final X minutes:
  → extend `end_time` by X minutes  
- Default: 2 minutes  
- Extensions handled inside DB transaction  

### **5. Auction Ending**
- When `end_time` passes:
  - Auction transitions to `ended`  
  - Highest valid bids become hammer prices  
  - Invoice generation runs  

### **6. Settlement**
- Auction becomes `settled` only when:
  - all invoices are paid  
  - or cancelled with reason  
- Settlement RPC creates consignor payouts  

---

## 🧭 **Pages**

### **/auctions**
- Public list of scheduled, live, and ended auctions  
- Shows countdown timers  
- Shows item counts  

### **/auctions/[id]**
- Auction detail  
- Item list  
- Status indicators  
- Realtime updates during live auctions  

### **/admin/auctions**
- Create/edit auctions  
- Assign items  
- View auction performance  
- Trigger settlement  

---

## 🔐 **RLS Rules**

### **Public**
- `select` scheduled, live, and ended auctions  
- Cannot see draft or settled auctions  

### **Bidder**
- Same as public  
- Additional access to bidding UI  

### **Consignor**
- Same as public  
- Can see their own items inside auctions  

### **Admin**
- Full read/write  
- Cannot reopen ended auctions  
- Cannot modify hammer prices  
- Cannot bypass settlement logic  

---

## 🧱 **Module Dependencies**

### **Depends on:**
- Users (admin role)
- Items (assignment)
- Bidding (live phase)
- Invoices (post‑end)
- Payouts (settlement)

### **Required before:**
- Realtime polish  
- Admin analytics  

---

## 🛠 **Implementation Notes**

- Use server actions for admin operations  
- Auction transitions should be DB‑driven  
- Scheduled function updates status from:
  - scheduled → live  
  - live → ended  
- Soft‑close logic must run inside `place_bid` RPC  
- Invoice generation must be idempotent  
- Settlement must be idempotent  

---

Whenever you’re ready, say:

**“Let’s begin Phase 1.”**
