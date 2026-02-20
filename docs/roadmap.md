# 🗺️ **Tartami — 10‑Week Build Roadmap**

This roadmap defines the **sequential, module‑based build order** for Tartami.  
Each phase builds on the previous one.  
No phase begins until the prior phase is stable, tested, and documented.

The order reflects Tartami’s philosophy:  
**Engine first. UI second.**

---

# **Phase 1 — Foundation (Week 1–2)**  
### **Goal:** Establish identity, access control, and a protected application shell.

## **Database**
- Create `user_profiles`  
- Add full RLS for users and admins  
- Add trigger to sync `auth.users → user_profiles`  

## **Frontend**
- `/account/profile` (view + edit + masking toggle)  
- Protected `/app` layout (redirect unauthenticated users)  
- Approval gating (unapproved users blocked from bidding/submissions)  

## **Infrastructure**
- Deploy Vercel + Supabase starter  
- Configure environment variables  
- Confirm local dev environment  
- Set up GitHub repo + CI basics  

---

# **Phase 2 — Auctions & Items (Week 3–4)**  
### **Goal:** Build the core auction structure and item submission workflow.

## **Database**
- Create `auctions`, `items`, `item_submissions`  
- Add RLS for consignors and admins  
- Add approval workflow for submissions  

## **Frontend**
- `/auctions` (list)  
- `/auctions/[id]` (details + items)  
- `/submissions/new` (item submission form)  
- `/admin/auctions` (create/edit draft auctions)  
- `/admin/submissions` (review + approve/reject)  

---

# **Phase 3 — Bidding Engine (Week 5–6)**  
### **Goal:** Implement increment‑only bidding with soft‑close and realtime UI.

## **Database**
- Create `bids`  
- Implement `place_bid` RPC  
- Add increment enforcement  
- Add soft‑close logic  
- Add bid validation rules  
- Add masked identity label generation  

## **Frontend**
- Item detail bidding UI  
- Realtime bid updates  
- Masked identity display  
- Bid history list  

---

# **Phase 4 — Invoices & Payments (Week 7)**  
### **Goal:** Generate invoices and record offline payments.

## **Database**
- Create `invoices`, `payments`  
- Implement invoice generation RPC (idempotent)  
- Add append‑only payment model  
- Add invoice status transitions  

## **Frontend**
- `/invoices` (list)  
- `/invoices/[id]` (details + line items)  
- `/admin/invoices` (record payments + adjustments)  

---

# **Phase 5 — Settlement & Payouts (Week 8)**  
### **Goal:** Calculate consignor payouts after invoices are fully paid.

## **Database**
- Create `consignor_payouts`  
- Implement settlement RPC (idempotent)  
- Add payout calculation logic  

## **Frontend**
- `/admin/settlement` (run settlement + view results)  
- `/admin/payouts` (mark payouts as paid)  
- `/payouts` (consignor view)  

---

# **Phase 6 — Notifications (Week 9)**  
### **Goal:** Add realtime alerts and user inbox.

## **Database**
- Create `notifications`  
- Add triggers for:
  - outbid  
  - auction live  
  - invoice ready  
  - payout ready  
  - admin alerts  

## **Frontend**
- Notification inbox  
- Realtime toasts  
- Badge indicators  

---

# **Phase 7 — Admin Console (Week 10)**  
### **Goal:** Build the full administrative control panel.

## **Frontend**
- `/admin` dashboard  
- `/admin/users` (approvals + admin promotions)  
- `/admin/logs` (audit log viewer)  
- `/admin/items` (filter by consignor + assign to auctions)  
- `/admin/auctions` (final polish)  

---

# **Completion Criteria**

Tartami v1 is complete when:

- All modules are implemented  
- All RLS policies are enforced  
- All RPCs are idempotent  
- All financial tables are append‑only  
- Admin console is fully operational  
- Realtime bidding is stable  
- Settlement and payouts are correct  
- Documentation is complete  

---
