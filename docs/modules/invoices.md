# 🧾 **Invoices & Payments Module**

The Invoices & Payments module handles all post‑auction financial flows.  
It is fully **append‑only**, **admin‑verified**, and **database‑driven**.  
No financial logic lives in the frontend.

---

## 🗄️ **Tables**

### **1. invoices**
Represents a bidder’s total obligation for a single auction.

Fields include:

- `id`
- `auction_id`
- `bidder_id`
- `total` (hammer price + buyer premium)
- `status` (unpaid, paid, cancelled)
- `created_at`
- `updated_at`

### **2. payments**
Append‑only record of offline payments.

Fields include:

- `id`
- `invoice_id`
- `amount`
- `method` (cash, transfer, mobile money)
- `admin_id`
- `created_at`

---

## ⭐ **Core Rules**

### **1. One Invoice Per Auction Per Bidder**
- If a bidder wins multiple items in the same auction:  
  → **one invoice** with multiple line items  
- Enforced by invoice generation RPC

### **2. Buyer Premium Applied**
- Regular auctions: **10%**
- Special auctions: **15%**
- Applied automatically during invoice generation

### **3. Payments Are Offline**
- No online card processing  
- Admin records payments manually  
- Payment methods include:
  - cash  
  - bank transfer  
  - mobile money  

### **4. Admin Marks Invoice as Paid**
- Invoice becomes `paid` when:  
  **sum(payments) ≥ invoice.total**
- Overpayments create a positive balance (rare but allowed)
- Wrong payments → reversal entry (negative payment)

### **5. Append‑Only Financial Model**
- No deleting invoices  
- No deleting payments  
- No editing totals  
- Corrections = additive adjustments only

---

## 🔄 **Flow**

### **1. Auction Ends**
- Highest valid bids determine hammer prices  
- Invoice generation RPC runs  
- One invoice per bidder per auction is created

### **2. User Pays Offline**
- Cash / transfer / mobile money  
- Admin records payment in `/admin/invoices`

### **3. Invoice Becomes Paid**
- When total payments ≥ invoice total  
- Triggers settlement eligibility

---

## 🧭 **Pages**

### **/invoices**
- List of user’s invoices  
- Status indicators  
- Payment history  

### **/invoices/[id]**
- Invoice detail  
- Line items  
- Payment history  
- Masked bidder identity not needed (user sees their own)

### **/admin/invoices**
- Admin view of all invoices  
- Record payments  
- Add adjustments  
- Cancel unpaid invoices  
- View audit logs  

---

## 🔐 **RLS Rules**

### **Bidder**
- `select` only their own invoices  
- `select` only their own payments  
- Cannot modify anything

### **Admin**
- Full read/write  
- Can record payments  
- Can add adjustments  
- Can cancel unpaid invoices  
- Cannot delete invoices  
- Cannot delete payments  
- Cannot modify totals after creation

### **Public**
- No access

---

## 🧱 **Module Dependencies**

### **Depends on:**
- Users (identity + approval)
- Auctions (auction lifecycle)
- Bidding (hammer prices)

### **Required before:**
- Settlement module  
- Payouts module  

Because settlement depends on invoices being fully paid.

---

## 🛠 **Implementation Notes**

- Invoice generation must be **idempotent**  
  (running twice must not create duplicates)
- Payment recording must be append‑only  
- All admin actions must be logged  
- Totals must be calculated in the database  
- No frontend calculation of financial amounts  
- Use server actions for admin operations  

---

Then tell me:

**“Let’s write the Payouts module.”**
