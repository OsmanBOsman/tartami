# **Tartami — Product Overview**

Tartami is a Somali‑rooted, premium, approval‑based auction platform designed for trust, privacy, and cultural authenticity.  
It blends modern auction mechanics with Somali expectations around fairness, identity protection, and offline financial flows.

---

## **Core Principles**

- All bidders must be approved before bidding  
- All items are consigned at the **item level** (never auction‑level consignors)  
- Auctions follow **increment‑only** bidding  
- **Soft‑close** with anti‑sniping  
- Buyer premium:
  - 10% for regular auctions  
  - 15% for special auctions  
- All payments happen **offline** (cash, transfer, mobile money)  
- Admins record payments and mark invoices as paid  
- Settlement generates consignor payouts  
- Identity masking is always respected across the platform  

---

## **User Roles**

### **Bidder**
Approved participant who can place bids and receive invoices.

### **Consignor**
Item owner who submits items and receives payouts.

### **Admin**
Full operational control, but strictly bounded by:
- RLS  
- financial invariants  
- audit logging  
- no deletion of financial records  

---

## **High‑Level Flows**

### **1. User Onboarding**
User registers → admin approves → user can bid or submit items.

### **2. Item Submission**
User submits item → admin reviews → admin approves → item becomes eligible for auction assignment.

### **3. Auction Lifecycle**
Auction scheduled → auction goes live → users bid → soft‑close extensions apply → auction ends.

### **4. Post‑Auction**
Invoices generated → admins record offline payments → invoices become paid.

### **5. Settlement**
Once all invoices are paid → settlement RPC runs → consignor payouts created.

### **6. Payouts**
Admins mark payouts as paid → consignors receive funds offline.

---
