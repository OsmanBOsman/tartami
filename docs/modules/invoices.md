# 🧾 **Invoices & Payments Module**

The Invoices & Payments Module manages all post‑auction financial flows.  
It is fully **append‑only**, **admin‑verified**, **database‑driven**, and **idempotent** (safe to run multiple times without creating duplicate invoices or duplicate payments).

No financial logic lives in the frontend.  
All totals, adjustments, and validations are computed in the database.

---

# **1. Table Definitions**

## **invoices**
Represents a bidder’s total obligation for a single auction.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Invoice ID |
| `auction_id` | uuid (FK → auctions.id) | Auction this invoice belongs to |
| `bidder_id` | uuid (FK → user_profiles.id) | Bidder being billed |
| `total` | numeric | Hammer price + buyer premium |
| `status` | enum(`unpaid`, `paid`, `cancelled`) | Invoice lifecycle |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Auto‑updated |

**Notes:**
- One invoice per bidder per auction  
- Totals are immutable after creation  

---

## **payments**
Append‑only record of offline payments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Payment ID |
| `invoice_id` | uuid (FK → invoices.id) | Invoice being paid |
| `amount` | numeric | Payment amount |
| `method` | text | cash, transfer, mobile money |
| `admin_id` | uuid (FK → user_profiles.id) | Admin who recorded the payment |
| `created_at` | timestamptz | Timestamp |

**Notes:**
- No updates  
- No deletes  
- Reversals = negative payments  

---

# **2. Core Rules**

## **1. One Invoice Per Auction Per Bidder**
If a bidder wins multiple items in the same auction:

→ **One invoice** with multiple line items.

Enforced by the invoice generation RPC.

---

## **2. Buyer Premium Applied Automatically**
- Regular auctions: **10%**  
- Special auctions: **15%**  

Commission rate comes from the auction record and is locked once the auction is live.

---

## **3. Payments Are Offline**
No online card processing.

Admins record payments manually using:

- cash  
- bank transfer  
- mobile money  

---

## **4. Admin Marks Invoice as Paid**
An invoice becomes **paid** when:

```
sum(payments.amount) ≥ invoice.total
```

Rules:
- Overpayments create a positive balance  
- Wrong payments → reversal entry (negative payment)  
- No editing or deleting payments  

---

## **5. Append‑Only Financial Model**
- No deleting invoices  
- No deleting payments  
- No editing totals  
- All corrections are additive adjustments  
- All financial actions must be logged  

---

# **3. Invoice Workflow**

## **A. Auction Ends**
- Highest valid bids determine hammer prices  
- Invoice generation RPC runs  
- One invoice per bidder per auction is created  
- Invoice generation must be **idempotent**  
  (running twice must not create duplicate invoices)

---

## **B. User Pays Offline**
- Cash / transfer / mobile money  
- Admin records payment in `/admin/invoices`  
- Payment is append‑only  

---

## **C. Invoice Becomes Paid**
When total payments ≥ invoice total:

- Invoice transitions to `paid`  
- Auction becomes eligible for settlement  

---

# **4. Invariants**

These rules **cannot be broken**.

### **Invoice Invariants**
- One invoice per bidder per auction  
- Totals are immutable  
- Status moves forward only  
- No deletion of invoices  

### **Payment Invariants**
- Payments are append‑only  
- No edits  
- No deletes  
- Reversals = negative payments  
- Payment recording must be idempotent (no duplicate payments on retry)  

### **Financial Invariants**
- All totals computed in the database  
- No frontend calculation  
- All admin actions logged  

---

# **5. RLS Rules**

## **Bidder**
Allowed:
- `select` their own invoices  
- `select` their own payments  

Not allowed:
- modifying invoices  
- modifying payments  

---

## **Admin**
Allowed:
- full read/write  
- record payments  
- add adjustments  
- cancel unpaid invoices  

Not allowed:
- deleting invoices  
- deleting payments  
- modifying totals after creation  

---

## **Public**
- No access  

---

# **6. UI Pages**

### **/invoices**
- List of user’s invoices  
- Status indicators  
- Payment history  

### **/invoices/[id]**
- Invoice detail  
- Line items  
- Payment history  

### **/admin/invoices**
- Admin view of all invoices  
- Record payments  
- Add adjustments  
- Cancel unpaid invoices  
- View audit logs  

---

# **7. Failure & Recovery**

### If invoice generation fails:
- Retry is safe  
- Idempotent logic prevents duplicate invoices  

### If payment recording fails:
- Retry is safe  
- Idempotent logic prevents duplicate payments  

### If admin enters wrong payment:
- Add reversal entry (negative amount)  

### If totals mismatch:
- Admin adds adjustment line item  

---

# **8. Module Dependencies**

### **Depends on:**
- Users (identity + approval)  
- Auctions (commission rate + lifecycle)  
- Bidding (hammer prices)  

### **Required before:**
- Settlement  
- Payouts  

Because settlement depends on invoices being fully paid.

---

# **9. Implementation Notes**

- Invoice generation must be **idempotent** (no duplicate invoices)  
- Payment recording must be **append‑only**  
- Totals must be computed in the database  
- No frontend financial logic  
- Use server actions for admin operations  
- All admin actions must be logged  

---
