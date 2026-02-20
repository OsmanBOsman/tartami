# 🛍️ **Tartami — Product Overview**

Tartami is a Somali‑rooted, premium, approval‑based auction platform designed for **trust**, **privacy**, and **cultural authenticity**.  
It blends modern auction mechanics with Somali expectations around fairness, identity protection, and offline financial flows.

Tartami is not a marketplace — it is a **curated auction house** with strict rules, predictable behavior, and database‑enforced integrity.

---

# **1. Product Principles**

Tartami is built on the following core principles:

### **1. Approval‑Based Participation**
Only approved users may bid or submit items.

### **2. Item‑Level Consignment**
Every item has a single consignor.  
There are **no auction‑level consignors**.

### **3. Increment‑Only Bidding**
No custom amounts.  
No proxy bids.  
No auto‑bids.  
No self‑bidding.

### **4. Soft‑Close Anti‑Sniping**
Bids in the final minutes extend the auction.

### **5. Buyer Premium**
- **10%** for regular auctions  
- **15%** for special auctions  

### **6. Offline Payments**
All payments occur outside the platform:
- cash  
- bank transfer  
- mobile money  

Admins record payments manually.

### **7. Settlement & Payouts**
Once invoices are fully paid:
- settlement RPC runs  
- consignor payouts are created  
- admins mark payouts as paid  

### **8. Identity Masking**
Masking is a first‑class feature:
- bidders see masked competitors  
- consignors see masked bidders  
- admins always see real identity  

---

# **2. User Roles**

## **Bidder**
An approved participant who:
- places bids  
- receives invoices  
- pays offline  
- controls their masking preference  

## **Consignor**
An item owner who:
- submits items  
- sees masked bidder activity  
- receives payouts after settlement  

## **Admin**
An operational role with elevated but **bounded** capabilities:
- approves users  
- reviews item submissions  
- creates auctions  
- records payments  
- adds adjustments  
- cancels unpaid invoices  
- marks payouts as paid  

Admins cannot:
- delete financial records  
- modify hammer prices  
- bypass RLS  
- override settlement logic  

---

# **3. High‑Level Product Flows**

## **1. User Onboarding**
1. User registers  
2. `user_profiles` row created  
3. Admin approves  
4. User can bid or submit items  

---

## **2. Item Submission**
1. User submits item  
2. Admin reviews  
3. Admin approves or rejects  
4. Approved items become eligible for auction assignment  

---

## **3. Auction Lifecycle**
1. Admin schedules auction  
2. Auction goes live  
3. Users place increment‑only bids  
4. Soft‑close extensions apply  
5. Auction ends  

---

## **4. Post‑Auction**
1. Invoices generated (idempotent RPC)  
2. Admin records offline payments  
3. Invoice becomes `paid` when payments ≥ total  

---

## **5. Settlement**
1. All invoices for the auction must be paid  
2. Settlement RPC runs  
3. Payouts created per item  
4. Auction marked as `settled`  

---

## **6. Payouts**
1. Admin pays consignors offline  
2. Admin marks payouts as `paid`  
3. Audit log entry created  

---

# **4. Product Identity**

Tartami is designed to feel:

- **Premium** — curated items, controlled access  
- **Somali‑authentic** — masking, fairness, respect  
- **Trustworthy** — append‑only financial model  
- **Predictable** — deterministic database logic  
- **Safe** — strict RLS and admin boundaries  

This is not a chaotic open marketplace.  
It is a **modern digital auction house** with cultural grounding and technical rigor.

---
