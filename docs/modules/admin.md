# 🛠️ **Admin Module**

The Admin Module provides the operational backbone of Tartami.  
Admins have elevated capabilities but remain **strictly bounded** by RLS, financial invariants, and audit logging.  
This module ties together all other modules into a unified, controlled, and auditable system.

Admins can **never** bypass database logic, financial rules, or settlement constraints.

---

# **1. Capabilities**

## **1. User Management**
Admins can:
- Approve bidders  
- Promote/demote admins  
- View user profiles  
- View usernames and full names (admin tools only)  
- View user activity (future)  

Admins cannot:
- Impersonate users  
- Modify user financial data  
- Bypass approval rules  

---

## **2. Auction Management**
Admins can:
- Create auctions  
- Edit draft/scheduled auctions  
- Assign items to auctions  
- View auction performance  

Admins cannot:
- Reopen ended auctions  
- Modify hammer prices  
- Change commission rate once auction is live  
- Remove items from live auctions  

---

## **3. Item Submissions**
Admins can:
- Review pending submissions  
- Approve or reject  
- Convert submissions → items  
- Assign items to auctions  

Admins cannot:
- Edit consignor ownership  
- Modify item starting_bid after approval  

---

## **4. Invoices**
Admins can:
- View all invoices  
- Record offline payments  
- Add adjustments (append‑only)  
- Cancel unpaid invoices  

Admins cannot:
- Delete invoices  
- Delete payments  
- Modify invoice totals  
- Mark invoices as paid without a recorded payment  

---

## **5. Payouts**
Admins can:
- Run settlement  
- View consignor payouts  
- Mark payouts as paid  

Admins cannot:
- Modify payout amounts  
- Delete payouts  
- Settle auctions early  
- Override settlement logic  

---

## **6. Audit Logs**
Admins can:
- View all admin actions  
- Filter by user, action, date  

Audit logs are:
- Immutable  
- Append‑only  
- Required for every sensitive action  

---

# **2. Admin Pages**

## **/admin**
- Overview dashboard  
- Quick stats  
- Pending approvals  
- Upcoming auctions  

---

## **/admin/users**
- User list  
- Approvals  
- Admin promotions  
- Profile details (username + full name)  

---

## **/admin/auctions**
- Create/edit auctions  
- Assign items  
- View auction status  

---

## **/admin/items**
- View approved items  
- Assign to auctions  
- Filter by consignor  

---

## **/admin/submissions**
- Review pending submissions  
- Approve/reject  
- View submission history  

---

## **/admin/invoices**
- View all invoices  
- Record payments  
- Add adjustments  
- Cancel unpaid invoices  

---

## **/admin/payouts**
- View consignor payouts  
- Mark payouts as paid  

---

## **/admin/logs**
- Full audit log  
- Filter by action type  
- Filter by admin  

---

# **3. Rules & Boundaries**

## **1. All Admin Actions Are Logged**
Every sensitive action writes to `audit_logs`, including:

- approvals  
- rejections  
- payments  
- adjustments  
- cancellations  
- auction status changes  
- settlement actions  

Audit logs are immutable and append‑only.

---

## **2. Admins Cannot Bypass Payout Logic**
Admins cannot:
- modify payout amounts  
- delete payouts  
- settle auctions early  
- override invoice totals  
- mark payouts as paid without audit logging  

---

## **3. Admins Cannot Delete Financial Records**
Admins cannot delete:
- invoices  
- payments  
- bids  
- payouts  

Admins cannot edit:
- hammer prices  
- invoice totals  
- payout amounts  

---

## **4. Admins Cannot Bypass RLS**
Admins have elevated access but remain bound by:

- financial invariants  
- settlement rules  
- username‑only identity model  
- append‑only financial model  

Admins cannot impersonate users or access private bidder information outside admin‑approved contexts.

---

# **4. Module Dependencies**

## **Depends on:**
- Users  
- Items  
- Auctions  
- Bidding  
- Invoices  
- Payments  
- Payouts  
- Notifications  

## **Required before:**
- Production hardening  
- Realtime polish  
- Admin analytics (future)  

---

# **5. Implementation Notes**

- Use server actions for all admin operations  
- All admin actions must write to `audit_logs`  
- Admin UI must display username + full name only in admin contexts  
- Admin cannot impersonate users  
- Admin cannot bypass DB logic  
- All financial actions must be append‑only and idempotent  

---
