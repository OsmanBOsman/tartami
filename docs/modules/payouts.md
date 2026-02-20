# 💸 **Settlement & Payouts Module**

The Settlement & Payouts module finalizes the financial lifecycle of an auction.  
It ensures consignors are paid **only after** all related invoices are fully settled.  
This module is deterministic, append‑only, and fully database‑driven.

---

## 🗄️ **Tables**

### **consignor_payouts**
Represents the payout owed to a consignor for a specific item or invoice.

Fields include:

- `id`
- `invoice_id`
- `item_id`
- `consignor_id`
- `hammer_price`
- `commission_rate`
- `payout_amount` (hammer − commission)
- `status` (pending, paid)
- `admin_id` (who marked as paid)
- `created_at`
- `updated_at`

---

## ⭐ **Core Rules**

### **1. Settlement Only When All Invoices Are Paid**
- An auction cannot be settled until **every invoice** in that auction is:
  - fully paid  
  - cancelled with a logged reason  

### **2. Payout Formula**
```
payout = hammer_price − commission
```

Commission rate comes from the auction:

- Regular auctions: 10%
- Special auctions: 15%

### **3. Admin Marks Payout as Paid**
- Payments to consignors happen offline  
- Admin records payout manually  
- Status changes from `pending` → `paid`  
- Append‑only: no deletion or modification  

### **4. Append‑Only Financial Model**
- No editing payout amounts  
- No deleting payouts  
- Corrections = additive adjustments (rare)  
- All admin actions logged  

---

## 🔄 **Flow**

### **1. Auction Ends**
- Invoices are generated  
- Payments are recorded  
- Once all invoices are paid → settlement becomes available  

### **2. Settlement RPC Runs**
- Calculates payout per item  
- Creates rows in `consignor_payouts`  
- Marks auction as `settled`  

### **3. Admin Pays Consignors**
- Offline payment  
- Admin marks payout as `paid`  
- Audit log entry created  

---

## 🧭 **Pages**

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

## 🔐 **RLS Rules**

### **Consignor**
- `select` only their own payouts  
- Cannot modify anything  

### **Admin**
- Full read/write  
- Can mark payouts as paid  
- Cannot modify payout amounts  
- Cannot delete payouts  

### **Public**
- No access  

---

## 🧱 **Module Dependencies**

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

## 🛠 **Implementation Notes**

- Settlement RPC must be **idempotent**  
  (running twice must not duplicate payouts)
- Payout amounts must be calculated in the database  
- Admin marking payouts as paid must write to `audit_logs`
- No frontend calculation of financial amounts  
- Append‑only model ensures financial integrity  

---
Then tell me:

**“Let’s write the Notifications module.”**
