# 🔔 **Notifications Module**

The Notifications Module delivers realtime and inbox‑based alerts for all critical system events.  
Notifications are **database‑generated**, **RLS‑protected**, **append‑only**, and **never authoritative** — they are informational only.

All notification logic is triggered by **database events**, **RPCs**, or **admin actions**, ensuring consistency and auditability.

---

# **1. Table Definitions**

## **notifications**
Stores all user‑level notifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Notification ID |
| `user_id` | uuid (FK → user_profiles.id) | Recipient |
| `type` | enum | outbid, auction_live, invoice_ready, payout_ready, admin_alert |
| `title` | text | Short title |
| `body` | text | Full message |
| `is_read` | boolean | Read status |
| `metadata` | jsonb | Links to auctions/items/invoices/payouts |
| `created_at` | timestamptz | Timestamp |

**Notes:**
- Append‑only  
- No deletes  
- No edits except `is_read`  

---

# **2. Events That Trigger Notifications**

## **1. Outbid**
Triggered when:
- A user is outbid on an item  
- Fired inside the `place_bid` RPC  

Metadata includes:
- `item_id`  
- `auction_id`  
- `new_highest_bid`  

---

## **2. Auction Live**
Triggered when:
- Auction transitions `scheduled → live`  
- Sent to all approved bidders  

Metadata includes:
- `auction_id`  
- `start_time`  

---

## **3. Invoice Ready**
Triggered when:
- Auction ends  
- Invoice generation completes  

Metadata includes:
- `invoice_id`  
- `auction_id`  
- `total`  

---

## **4. Payout Ready**
Triggered when:
- Settlement RPC creates consignor payouts  

Metadata includes:
- `payout_id`  
- `auction_id`  
- `amount`  

---

## **5. Admin Alerts**
Triggered for:
- New user registrations  
- New item submissions  
- Payment reversals  
- Invoice cancellations  
- System anomalies  

Metadata includes:
- context‑specific fields  

---

# **3. Notification Workflow**

## **A. Event Occurs**
- Trigger or RPC inserts a row into `notifications`  
- Realtime broadcast fires (optional)  

---

## **B. UI Updates**
- Realtime toast appears  
- Notification count updates  
- User opens inbox  

---

## **C. User Reads Notification**
- `is_read = true`  
- Notification remains stored (append‑only)  

---

# **4. Invariants**

These rules **cannot be broken**.

### **Notification Invariants**
- Notifications are append‑only  
- No deletion  
- No editing except `is_read`  
- All notifications must reference a valid user  
- All notifications must include metadata  

### **Identity Invariants**
- Users see only their own notifications  
- Admins cannot read user notifications  
- Admins see only admin‑targeted alerts  

### **Realtime Invariants**
- Realtime is optional  
- Database is the authority  
- UI must re-fetch if realtime fails  

---

# **5. RLS Rules**

## **User**
Allowed:
- `select` only their own notifications  
- `update` only their own notifications (`is_read`)  

Not allowed:
- inserting notifications  
- reading others’ notifications  

---

## **Admin**
Allowed:
- `select` admin‑targeted notifications  

Not allowed:
- reading user notifications  
- deleting notifications  
- modifying notifications  

---

## **Public**
- No access  

---

# **6. UI Pages**

### **/notifications**
- User inbox  
- List of all notifications  
- Mark as read  
- Links to related pages:
  - auction  
  - item  
  - invoice  
  - payout  

---

# **7. Failure & Recovery**

### If realtime fails:
- UI re-fetches from DB  

### If trigger fails:
- RPC retries  
- Notification insertion is idempotent (safe to retry without duplicates)  

### If metadata is missing:
- Notification still delivered  
- UI gracefully degrades  

### If user is deleted:
- Notifications remain for audit  
- RLS prevents access  

---

# **8. Module Dependencies**

### **Depends on:**
- Users (identity + approval)  
- Bidding (outbid events)  
- Auctions (auction live events)  
- Invoices (invoice ready)  
- Payouts (payout ready)  

### **Required before:**
- Admin console  
- Realtime polish  
- User inbox UX  

---

# **9. Implementation Notes**

- Use triggers for:
  - outbid  
  - auction live  
  - invoice ready  
  - payout ready  

- Use server actions for admin alerts  
- Realtime is optional; DB is the authority  
- Notifications must be lightweight and fast  
- No deletion — append‑only for auditability  
- Metadata must always include enough context for UI linking  

---
