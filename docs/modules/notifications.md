# 🔔 **Notifications Module**

The Notifications module delivers realtime and inbox‑based alerts for all critical system events.  
Notifications are **database‑generated**, **RLS‑protected**, and **never authoritative** — they are informational only.

---

## 🗄️ **Tables**

### **notifications**
Stores all user‑level notifications.

Fields include:

- `id`
- `user_id`
- `type` (outbid, auction_live, invoice_ready, payout_ready, admin_alert)
- `title`
- `body`
- `is_read`
- `created_at`
- `metadata` (JSON for linking to auctions/items/invoices)

---

## ⭐ **Events That Trigger Notifications**

### **1. Outbid**
Triggered when:
- A user is outbid on an item  
- Fired inside the `place_bid` RPC  
- Includes:
  - item_id  
  - auction_id  
  - new highest bid  

### **2. Auction Live**
Triggered when:
- Auction transitions from `scheduled` → `live`  
- Sent to all approved bidders  

### **3. Invoice Ready**
Triggered when:
- Auction ends  
- Invoice generation completes  
- Sent to all bidders with invoices  

### **4. Payout Ready**
Triggered when:
- Settlement RPC creates consignor payouts  
- Sent to consignors  

### **5. Admin Alerts**
Triggered for:
- New user registrations  
- New item submissions  
- Payment reversals  
- Invoice cancellations  
- System anomalies  

---

## 🔄 **Flow**

### **1. Event Occurs**
- Trigger or RPC inserts a row into `notifications`  
- Realtime broadcast fires (optional)

### **2. UI Updates**
- Realtime toast appears  
- Notification count updates  
- User can open inbox

### **3. User Reads Notification**
- `is_read = true`  
- No deletion — append‑only model  

---

## 🧭 **Pages**

### **/notifications**
- User inbox  
- List of all notifications  
- Mark as read  
- Link to related pages (auction, item, invoice, payout)

---

## 🔐 **RLS Rules**

### **User**
- `select` only their own notifications  
- `update` only their own notifications (mark as read)

### **Admin**
- `select` only admin‑targeted notifications  
- Cannot read user notifications  
- Cannot delete notifications  

### **Public**
- No access  

---

## 🧱 **Module Dependencies**

### **Depends on:**
- Users (identity + approval)
- Bidding (outbid events)
- Auctions (auction live events)
- Invoices (invoice ready)
- Payouts (payout ready)

### **Required before:**
- Admin console  
- Realtime polish  

---

## 🛠 **Implementation Notes**

- Use triggers for:
  - outbid  
  - auction live  
  - invoice ready  
  - payout ready  

- Use server actions for admin alerts  
- Realtime is optional; DB is the authority  
- Notifications must be lightweight and fast  
- No deletion — append‑only for auditability  

---
Then tell me:

**“Let’s write the Auctions module.”**
