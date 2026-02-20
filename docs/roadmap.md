# 🗺️ **Tartami — 10‑Week Build Roadmap**

This roadmap defines the **sequential, module‑based build order** for Tartami.  
Each phase builds on the previous one.  
No phase begins until the prior phase is stable.

---

## **Phase 1 — Foundation (Week 1–2)**  
**Goal:** Establish identity, access, and protected app shell.

### **Database**
- Create `user_profiles`
- Add full RLS for users and admins

### **Frontend**
- Build `/account/profile`
- Build protected `/app` layout (redirect unauthenticated users)

### **Infrastructure**
- Deploy Vercel + Supabase starter  
- Configure environment variables  
- Confirm local dev environment  

---

## **Phase 2 — Auctions & Items (Week 3–4)**  
**Goal:** Create the core auction structure and item submission workflow.

### **Database**
- Create `auctions`, `items`, `item_submissions`
- Add RLS for consignors and admins

### **Frontend**
- `/auctions`
- `/auctions/[id]`
- `/submissions/new`
- `/admin/auctions`
- `/admin/submissions`

---

## **Phase 3 — Bidding Engine (Week 5–6)**  
**Goal:** Implement increment‑only bidding with soft‑close.

### **Database**
- Create `bids`
- Implement `place_bid` RPC
- Add soft‑close logic
- Add bid validation + increment enforcement

### **Frontend**
- Item detail page
- Realtime bid updates
- Masked identity display

---

## **Phase 4 — Invoices & Payments (Week 7)**  
**Goal:** Generate invoices and record offline payments.

### **Database**
- Create `invoices`, `payments`
- Implement invoice generation function
- Add append‑only payment model

### **Frontend**
- `/invoices`
- `/invoices/[id]`
- `/admin/invoices`

---

## **Phase 5 — Settlement & Payouts (Week 8)**  
**Goal:** Calculate consignor payouts after invoices are paid.

### **Database**
- Create `consignor_payouts`
- Implement settlement RPC

### **Frontend**
- `/admin/settlement`
- `/admin/payouts`
- `/payouts`

---

## **Phase 6 — Notifications (Week 9)**  
**Goal:** Add realtime alerts and inbox.

### **Database**
- Create `notifications`
- Add triggers for:
  - outbid  
  - auction live  
  - invoice ready  
  - payout ready  
  - admin alerts  

### **Frontend**
- Notification inbox
- Realtime toasts

---

## **Phase 7 — Admin Console (Week 10)**  
**Goal:** Build the full administrative control panel.

### **Frontend**
- `/admin` dashboard  
- `/admin/users`  
- `/admin/logs`  

---
