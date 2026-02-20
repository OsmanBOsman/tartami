# 🗄️ Tartami — Database Schema Overview

Tartami uses a **Postgres‑first, RLS‑enforced, append‑only** schema.  
The database is the single source of truth for all financial, auction, and identity logic.

This document provides a human‑readable overview of the schema before implementation in `schema.sql`.

---

## 📦 Tables

### 1. user_profiles
- User identity  
- Approval status  
- Masking preference  
- Contact info  

### 2. auctions
- Auction metadata  
- Commission rate  
- Start/end times  
- Soft‑close configuration  
- Status transitions  

### 3. items
- Item details  
- Consignor reference  
- Auction assignment  
- Approval status  

### 4. item_submissions
- Raw submissions from consignors  
- Admin review workflow  
- Approval/rejection logs  

### 5. bids
- All bids placed  
- Increment‑only enforcement  
- Soft‑close triggers  
- Bidder identity (masked in UI)  

### 6. invoices
- One invoice per bidder per auction  
- Multiple line items  
- Immutable totals  
- Append‑only adjustments  

### 7. payments
- Offline payments recorded by admin  
- Append‑only  
- Reversals logged as negative entries  

### 8. consignor_payouts
- Settlement results  
- Per‑invoice payouts  
- Immutable once created  

### 9. notifications
- Outbid alerts  
- Invoice ready  
- Payout ready  
- Admin alerts  

### 10. audit_logs
- Admin approvals  
- Payment recordings  
- Invoice cancellations  
- Auction status changes  
- Financial adjustments  

---

## 🔗 Key Relationships

### auction → items
Each auction contains many items.

### item → bids
Each item receives many bids.

### auction + bidder → invoice
One invoice per bidder per auction.

### invoice → payments
Payments accumulate until invoice is fully paid.

### item → consignor_payout
Each item contributes to a consignor payout after settlement.

---

## ⚠️ Important Notes

### No online payments
All payments are offline (cash, transfer, mobile money).

### No deleting invoices or payments
Financial records are append‑only.

### No modifying hammer prices after auction end
Hammer price is immutable once the auction ends.

### All admin actions are logged
Every sensitive action writes to `audit_logs`.

