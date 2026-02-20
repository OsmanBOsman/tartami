# 💸 **Settlement & Payouts Module**

The Settlement & Payouts Module finalizes the financial lifecycle of an auction.  
It ensures consignors are paid **only after** all related invoices are fully settled.  
This module is deterministic, append‑only, idempotent (safe to run multiple times without creating duplicate payouts), and fully database‑driven.

---

# **1. Table Definitions**

## **consignor_payouts**
Represents the payout owed to a consignor for a specific item.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Payout ID |
| `invoice_id` | uuid (FK → invoices.id) | Invoice that generated this payout |
| `item_id` | uuid (FK → items.id) | Item sold |
| `consignor_id` | uuid (FK → user_profiles.id) | Consignor receiving payout |
| `hammer_price` | numeric | Final hammer price |
| `commission_rate` | numeric | Commission rate applied |
| `payout_amount` | numeric | hammer_price − commission |
| `status` | enum(`pending`, `paid`) | Payout lifecycle |
| `admin_id` | uuid (FK → user_profiles.id) | Admin who marked payout as paid |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Auto‑updated |

**Notes:**
- Append‑only  
- No editing payout amounts  
- No deleting payouts  

---

# **2. Core Rules**

## **1. Settlement Only When All Invoices Are Paid**
An auction cannot be settled until **every invoice** in that auction is:

- fully paid  
- or cancelled with a logged reason  

This ensures financial correctness and prevents premature payouts.

---

## **2. Payout Formula**

\[
payout = hammer\_price - commission
\]

Commission rate comes from the auction:

- Regular auctions: **10%**  
- Special auctions: **15%**

Commission is locked once the auction goes live.

---

## **3. Admin Marks Payout as Paid**
- Payments to consignors happen offline  
- Admin records payout manually  
- Status transitions: `pending → paid`  
- Append‑only: no deletion or modification  

---

## **4. Append‑Only Financial Model**
- No editing payout amounts  
- No deleting payouts  
- Corrections = additive adjustments (rare)  
- All admin actions logged  
- All calculations done in the database  

---

# **3. Settlement Workflow**

## **A. Auction Ends**
- Invoices are generated  
- Payments are recorded  
- Once all invoices are paid → settlement becomes available  

---

## **B. Settlement RPC Runs**
The settlement RPC:

1. Validates all invoices are paid  
2. Calculates payout per item  
3. Creates rows in `consignor_payouts`  
4. Marks auction as `settled`  

The RPC must be **idempotent**  
(safe to run multiple times without creating duplicate payouts).

---

## **C. Admin Pays Consignors**
- Offline payment  
- Admin marks payout as `paid`  
- Audit log entry created  

---

# **4. Invariants**

These rules **cannot be broken**.

### **Settlement Invariants**
- Auction cannot settle until all invoices are paid  
- Settlement RPC must be idempotent (never duplicate payouts)  
- Settlement is final and immutable  

### **Payout Invariants**
- Payout amounts are immutable  
- No deletion of payouts  
- No editing payout amounts  
- Status moves forward only (`pending → paid`)  

### **Financial Invariants**
- All calculations done in the database  
- No frontend financial logic  
- All admin actions logged  

---

# **5. RLS Rules**

## **Consignor**
Allowed:
- `select` only their own payouts  

Not allowed:
- modifying payouts  
- marking payouts as paid  

---

## **Admin**
Allowed:
- full read/write  
- mark payouts as paid  

Not allowed:
- modifying payout amounts  
- deleting payouts  

---

## **Public**
- No access  

---

# **6. UI Pages**

### **/admin/settlement**
- Shows auctions ready for settlement  
- Runs settlement RPC  
- Displays payout breakdown  

### **/admin/payouts**
- List of all consignor payouts  
- Mark payouts as paid  
- View audit logs  

### **/payouts**
- Consignor view of their payouts  
- Status indicators  
- Linked to invoices  

---

# **7. Failure & Recovery**

### If settlement RPC fails:
- Retry is safe  
- Idempotent logic prevents duplicate payouts  

### If admin marks payout incorrectly:
- Add adjustment payout (append‑only)  

### If invoice status changes unexpectedly:
- Settlement RPC refuses to run  
- Admin must resolve invoice state  

### If payout marking fails:
- Admin retries  
- No duplicate “paid” entries  

---

# **8. Module Dependencies**

### **Depends on:**
- Users (consignor identity)  
- Items (ownership)  
- Invoices (totals)  
- Payments (paid status)  

### **Required before:**
- Notifications module  
- Admin console  

Because payouts trigger notifications and appear in admin dashboards.

---

# **9. Implementation Notes**

- Settlement RPC must be **idempotent** (no duplicate payouts)  
- Payout amounts must be calculated in the database  
- Admin marking payouts as paid must write to `audit_logs`  
- No frontend calculation of financial amounts  
- Append‑only model ensures financial integrity  

---
