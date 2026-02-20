# 🏛️ **Auctions Module**

The Auctions Module defines how auctions are created, scheduled, activated, extended, ended, and settled.  
It is the **central lifecycle engine** that connects items, bidding, invoices, and payouts.

Tartami auctions follow a **strict, forward‑only lifecycle** with no backward transitions, ensuring fairness, predictability, and auditability.

---

# **1. Table Definitions**

## **auctions**
Stores all auction metadata and lifecycle state.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Auction ID |
| `title` | text | Public title |
| `description` | text | Full description |
| `commission_rate` | numeric | 10% or 15% (locked once live) |
| `start_time` | timestamptz | Scheduled start |
| `end_time` | timestamptz | Scheduled end (extendable via soft‑close) |
| `soft_close_window` | integer | Minutes added on last‑minute bids (default: 2) |
| `status` | enum(`draft`, `scheduled`, `live`, `ended`, `settled`) | Auction lifecycle |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Auto‑updated |

---

## **items**
Referenced here because items belong to auctions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Item ID |
| `auction_id` | uuid (FK → auctions.id, nullable) | Assigned auction |
| `consignor_id` | uuid (FK → user_profiles.id) | Item owner |
| `starting_bid` | numeric | Required (no reserves) |
| `status` | enum(`pending`, `approved`, `assigned`, `sold`, `unsold`) | Item lifecycle |

---

# **2. Auction Lifecycle**

Tartami auctions move **forward only**:

### **1. draft**
- Created by admin  
- Editable  
- Items can be assigned/unassigned  
- Not visible to public  

### **2. scheduled**
- Start/end times set  
- Visible to public  
- Items visible  
- Still editable by admin  

### **3. live**
- Bidding enabled  
- Soft‑close active  
- Items locked (no reassignment)  
- Commission rate locked  

### **4. ended**
- Bidding disabled  
- Hammer prices locked  
- Invoice generation runs (idempotent — safe to run multiple times without creating duplicate invoices)  
- No edits allowed  

### **5. settled**
- All invoices paid or cancelled  
- Payouts generated  
- Auction permanently closed  

**Auctions cannot move backward.**

---

# **3. Workflows**

## **A. Creation Workflow**
1. Admin creates auction in `draft`  
2. Admin sets:
   - title  
   - description  
   - commission rate  
   - start_time  
   - end_time  
   - soft_close_window  
3. Admin assigns approved items  
4. Admin transitions auction → `scheduled`

---

## **B. Going Live**
A scheduled function transitions:

- `scheduled → live` at `start_time`

When live:
- Bidding enabled  
- Soft‑close logic active  
- Items locked  
- Commission locked  

---

## **C. Soft‑Close Logic**
Soft‑close prevents last‑second sniping.

If a valid bid occurs within the final **X minutes**:

```
extend end_time by X minutes
```

Where:
- X = `soft_close_window` (default: 2 minutes)

Rules:
- Extensions must run inside the `place_bid` RPC  
- Extensions must be atomic  
- Extensions must be idempotent (safe to run multiple times without duplicating the extension)  
- Extensions must be logged  

---

## **D. Ending the Auction**
A scheduled function transitions:

- `live → ended` when `end_time` passes

When ended:
- Bidding disabled  
- Highest bids become hammer prices  
- Invoice generation runs (idempotent — no duplicate invoices)  

---

## **E. Settlement Workflow**
Auction transitions:

- `ended → settled`

Only when:
- all invoices are paid  
- or cancelled with reason  

Settlement RPC:
- generates consignor payouts  
- locks payout amounts  
- marks auction as settled (idempotent — no duplicate payouts)  

---

# **4. Invariants**

These rules **cannot be broken**.

### **Auction Invariants**
- Auctions move forward only  
- Commission rate cannot change once live  
- Items cannot be reassigned once live  
- Items cannot be removed once live  
- Soft‑close extensions must be atomic  
- Hammer prices cannot be edited  
- Settlement is final and immutable  

### **Identity Invariants**
- Public sees masked bidder identities  
- Consignors see masked identities  
- Admin sees full identities  

### **Financial Invariants**
- Invoice generation is idempotent (never creates duplicate invoices)  
- Settlement is idempotent (never creates duplicate payouts)  
- No manual payout overrides  
- No deletion of financial records  

---

# **5. RLS Rules**

## **Public**
- `select` scheduled, live, ended auctions  
- Cannot see draft or settled auctions  

## **Bidder**
- Same as public  
- Additional access to bidding UI  

## **Consignor**
- Same as public  
- Can view their own items inside auctions  

## **Admin**
- Full read/write  
- Cannot reopen ended auctions  
- Cannot modify hammer prices  
- Cannot bypass settlement logic  

---

# **6. Admin Tools**

### `/admin/auctions`
- Create/edit auctions  
- Assign/unassign items  
- Set start/end times  
- Trigger settlement  
- View auction performance  

### `/admin/auctions/[id]`
- Item list  
- Status indicators  
- Soft‑close logs  
- Settlement summary  

---

# **7. UI Pages**

### `/auctions`
- Public list  
- Shows scheduled, live, ended  
- Countdown timers  
- Item counts  

### `/auctions/[id]`
- Auction detail  
- Item list  
- Realtime updates during live auctions  
- Soft‑close extensions visible  

---

# **8. Failure & Recovery**

### If scheduled → live transition fails:
- Scheduled function retries  
- Auction remains scheduled  
- No partial state  

### If soft‑close extension fails:
- Bid transaction rolls back  
- No partial extension  
- Bidder retries  

### If invoice generation fails:
- Idempotent retry (safe to retry without creating duplicate invoices)  

### If settlement fails:
- Idempotent retry (safe to retry without creating duplicate payouts)  

---

# **9. Module Dependencies**

### **Depends on:**
- Users (admin role)  
- Items (assignment)  
- Bidding (live phase)  
- Invoices (post‑end)  
- Payouts (settlement)  

### **Required before:**
- Realtime polish  
- Admin analytics  
- Auction performance dashboards  

---

# **10. Implementation Notes**

- Use server actions for admin operations  
- Auction transitions should be DB‑driven  
- Scheduled functions handle lifecycle transitions  
- Soft‑close logic must run inside `place_bid` RPC  
- Invoice generation must be idempotent (no duplicate invoices)  
- Settlement must be idempotent (no duplicate payouts)  
- No manual overrides for financial data  

---
