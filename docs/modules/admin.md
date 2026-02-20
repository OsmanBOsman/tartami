# 🛠️ **Admin Module**

The Admin Module provides the operational backbone of Tartami.  
Admins have elevated capabilities but remain **strictly bounded** by RLS, financial invariants, and audit logging.  
This module ties together all other modules into a unified control panel.

---

## 🗄️ **Tools & Capabilities**

### **1. User Management**
- Approve bidders  
- Promote/demote admins  
- View user profiles  
- View masking preference  
- View user activity (future)  

### **2. Auction Management**
- Create auctions  
- Edit draft/scheduled auctions  
- Assign items to auctions  
- View auction performance  
- Cannot reopen ended auctions  
- Cannot modify hammer prices  

### **3. Item Submissions**
- Review pending submissions  
- Approve or reject  
- Convert submissions → items  
- Assign items to auctions  

### **4. Invoices**
- View all invoices  
- Record offline payments  
- Add adjustments (append‑only)  
- Cancel unpaid invoices  
- Cannot delete invoices  
- Cannot delete payments  

### **5. Payouts**
- Run settlement  
- View consignor payouts  
- Mark payouts as paid  
- Cannot modify payout amounts  

### **6. Audit Logs**
- View all admin actions  
- Filter by user, action, date  
- Immutable record of system activity  

---

## 🧭 **Pages**

### **/admin**
- Overview dashboard  
- Quick stats  
- Pending approvals  
- Upcoming auctions  

### **/admin/users**
- User list  
- Approvals  
- Admin promotions  
- Profile details  

### **/admin/auctions**
- Create/edit auctions  
- Assign items  
- View auction status  

### **/admin/items**
- View approved items  
- Assign to auctions  
- Filter by consignor  

### **/admin/submissions**
- Review pending submissions  
- Approve/reject  
- View submission history  

### **/admin/invoices**
- View all invoices  
- Record payments  
- Add adjustments  
- Cancel unpaid invoices  

### **/admin/payouts**
- View consignor payouts  
- Mark payouts as paid  

### **/admin/logs**
- Full audit log  
- Filter by action type  
- Filter by admin  

---

## 🔐 **Rules & Boundaries**

### **1. All Admin Actions Are Logged**
Every sensitive action writes to `audit_logs`, including:

- approvals  
- rejections  
- payments  
- adjustments  
- cancellations  
- auction status changes  
- settlement actions  

### **2. Admins Cannot Bypass Payout Logic**
- Cannot modify payout amounts  
- Cannot delete payouts  
- Cannot settle auctions early  
- Cannot override invoice totals  

### **3. Admins Cannot Delete Financial Records**
- No deleting invoices  
- No deleting payments  
- No deleting bids  
- No deleting payouts  
- No editing hammer prices  

### **4. Admins Cannot Bypass RLS**
- Admins have elevated access  
- But still bound by:
  - financial invariants  
  - settlement rules  
  - masking rules (UI-level)  

---

## 🧱 **Module Dependencies**

### **Depends on:**
- Users  
- Items  
- Auctions  
- Bidding  
- Invoices  
- Payments  
- Payouts  
- Notifications  

### **Required before:**
- Production hardening  
- Realtime polish  
- Admin analytics (future)  

---

## 🛠 **Implementation Notes**

- Use server actions for all admin operations  
- All admin actions must write to `audit_logs`  
- Admin UI must never expose masked identities incorrectly  
- Admin cannot impersonate users  
- Admin cannot bypass DB logic  

---
