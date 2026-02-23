# 💸 **Payouts Module**

The Payouts Module defines how consignors are paid after buyers settle their invoices.  
Payouts are **immutable**, **idempotent**, and generated only when an auction is fully settled.

Tartami uses **username‑only identity** for consignors and buyers in all payout contexts.

---

# **1. Table Definitions**

## **payouts**
Stores one payout per consignor per auction.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Payout ID |
| `auction_id` | uuid (FK → auctions.id) | Auction |
| `consignor_id` | uuid (FK → user_profiles.id) | Seller |
| `total_amount` | numeric | Total owed to consignor |
| `status` | enum(`pending`, `paid`) | Payout state |
| `created_at` | timestamptz | Timestamp |
| `updated_at` | timestamptz | Auto‑updated |

---

## **payout_items**
Stores each item contributing to a consignor payout.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Line item ID |
| `payout_id` | uuid (FK → payouts.id) | Parent payout |
| `item_id` | uuid (FK → items.id) | Item sold |
| `hammer_price` | numeric | Final winning bid |
| `commission_rate` | numeric | Commission applied |
| `payout_amount` | numeric | Amount owed to consignor |
| `created_at` | timestamptz | Timestamp |

---

# **2. Payout Generation Workflow**

Payouts are generated when an auction transitions:

```
ended → settled
```

Only when:

- all invoices are paid  
- or cancelled with reason  

Steps:

1. For each consignor, gather all items sold  
2. Compute:
   ```
   payout_amount = hammer_price - (hammer_price * commission_rate)
   ```
3. Create payout record  
4. Create payout_items  
5. Mark payout as `pending`  

**Payout generation is idempotent** — running it twice never creates duplicates.

---

# **3. Identity Rules**

- Payouts show **consignor username**  
- Admins see:
  - consignor username  
  - consignor full name (admin tools only)  
- No masking or aliasing exists anywhere  

---

# **4. Payment Workflow**

### **A. Admin pays consignor**
- Payment recorded externally  
- Admin marks payout as `paid`  
- Timestamp updated  

### **B. Consignor disputes payout**
- Admin adds note (future feature)  
- Payout remains immutable  

---

# **5. Invariants**

These rules **cannot be broken**:

### **Payout Invariants**
- One payout per consignor per auction  
- Payout amounts are immutable  
- No deletion of payouts  
- No deletion of payout_items  

### **Identity Invariants**
- Username is the only identity shown  
- Full names appear only in admin tools  
- No masking or aliasing  

### **Financial Invariants**
- Payout generation is idempotent  
- No manual overrides of hammer prices  
- No editing payout amounts  

---

# **6. RLS Rules**

## **Consignor**
Allowed:
- `select` own payouts  
- `select` own payout_items  

Not allowed:
- modifying payouts  
- viewing other consignors’ payouts  

---

## **Admin**
Allowed:
- full read/write  
- mark payouts as paid  

Not allowed:
- editing payout amounts  
- deleting payouts  

---

# **7. UI Pages**

### `/account/payouts`
- List of consignor payouts  
- Status indicators  
- Total amount  

### `/account/payouts/[id]`
- Payout detail  
- Line items  
- Commission  
- Payout amounts  

### `/admin/payouts`
- All payouts  
- Filters: pending, paid  
- Full identity (username + full name)  

---

# **8. Failure & Recovery**

### If payout generation fails:
- Idempotent retry  
- No duplicates  

### If payment update fails:
- Admin retries  
- No partial state  

---

# **Final Note**

Payouts complete the financial lifecycle of Tartami.  
They ensure consignors are paid accurately, transparently, and with full auditability.
