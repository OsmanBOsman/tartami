# 🔐 **Tartami — Row‑Level Security (RLS) Model**

Tartami enforces **full RLS** across all tables.  
The database is the authority for all access control.  
The frontend never decides who can see or modify data.

---

## ⭐ **General Rules**

- **RLS enabled on all tables**  
- **Default policy: DENY ALL**  
- Access is granted explicitly per role  
- Admins have elevated access but **cannot bypass financial logic**  
- All sensitive actions are logged in `audit_logs`

---

# 👤 **user_profiles**

### **User**
- `select` own profile  
- `update` own profile (masking preference, contact info)

### **Admin**
- `select` all  
- `update` all  
- Cannot impersonate users  
- Cannot bypass masking rules in UI (but sees real identity)

---

# 🏛️ **auctions**

### **Public**
- `select` auctions with status:  
  - `scheduled`  
  - `live`  
  - `ended`

### **Admin**
- Full read/write  
- Can create auctions  
- Can update draft/scheduled auctions  
- Cannot reopen ended auctions  
- Cannot modify hammer prices

---

# 📦 **items**

### **Public**
- `select` items belonging to visible auctions  
  (scheduled, live, ended)

### **Consignor**
- `select` items they own  
- Cannot see bidder identities  
- Cannot modify items after approval

### **Admin**
- Full read/write  
- Approves submissions  
- Assigns items to auctions

---

# 🎯 **bids**

### **Bidder**
- `insert` only if:
  - approved  
  - auction is live  
  - increment is valid  
- `select` masked bids for items in visible auctions

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

# 🧾 **invoices & payments**

### **Bidder**
- `select` only their own invoices  
- `select` only their own payments  
- Cannot modify anything

### **Admin**
- Full read/write  
- Records payments  
- Adds adjustments  
- Cancels unpaid invoices  
- Cannot delete invoices  
- Cannot delete payments  
- Cannot modify totals after creation

---

# 💰 **consignor_payouts**

### **Consignor**
- `select` only their own payouts  
- Cannot modify anything

### **Admin**
- Full read/write  
- Cannot modify payout amounts once created

---

# 📜 **audit_logs**

### **Admin**
- `select` all logs

### **Everyone**
- `insert` via backend triggers  
  (users never insert directly)

---
