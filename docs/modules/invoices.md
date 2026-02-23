# 🧾 **Invoices Module**

The Invoices Module defines how winning bids become financial obligations, how buyers are billed, and how auctions transition from “ended” to “settled.”  
Invoices are **immutable**, **append‑only**, and **generated automatically** when an auction ends.

Tartami uses **username‑only identity** in all invoice contexts.  
Full names are never shown in bidding or invoice UIs.

---

# **1. Table Definitions**

## **invoices**
Stores one invoice per winning bidder per auction.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Invoice ID |
| `auction_id` | uuid (FK → auctions.id) | Auction |
| `bidder_id` | uuid (FK → user_profiles.id) | Buyer |
| `status` | enum(`unpaid`, `paid`, `cancelled`) | Payment state |
| `total_amount` | numeric | Sum of all line items |
| `created_at` | timestamptz | Timestamp |
| `updated_at` | timestamptz | Auto‑updated |

---

## **invoice_items**
Stores each item won by the bidder.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Line item ID |
| `invoice_id` | uuid (FK → invoices.id) | Parent invoice |
| `item_id` | uuid (FK → items.id) | Item won |
| `hammer_price` | numeric | Final winning bid |
| `created_at` | timestamptz | Timestamp |

---

# **2. Invoice Generation Workflow**

Invoices are generated **automatically** when an auction transitions:

```
live → ended
```

Steps:

1. Identify highest valid bid for each item  
2. Group items by bidder  
3. Create one invoice per bidder  
4. Create invoice_items for each item won  
5. Compute total_amount  
6. Mark invoice as `unpaid`

**Invoice generation is idempotent** — running it twice never creates duplicates.

---

# **3. Identity Rules**

- Invoices show **bidder username**  
- Consignors see **buyer username** for items they sold  
- Admins see:
  - username  
  - full name (admin tools only)  
- No masking, aliasing, or anonymization exists anywhere

---

# **4. Payment Workflow**

### **A. Buyer pays invoice**
- Payment recorded externally (e.g., mobile money, bank transfer)  
- Admin marks invoice as `paid`  
- Timestamp updated  

### **B. Buyer fails to pay**
- Admin may mark invoice as `cancelled` with reason  
- Cancelled invoices do **not** generate payouts  

---

# **5. Invariants**

These rules **cannot be broken**:

### **Invoice Invariants**
- One invoice per bidder per auction  
- Invoice totals are immutable once created  
- Line items cannot be edited  
- No deletion of invoices  
- No deletion of invoice_items  

### **Identity Invariants**
- Username is the only identity shown  
- Full names appear only in admin tools  
- No masking or aliasing  

### **Financial Invariants**
- Invoice generation is idempotent  
- No manual overrides of hammer prices  
- No editing of totals after creation  

---

# **6. RLS Rules**

## **Bidder**
Allowed:
- `select` own invoices  
- `select` own invoice_items  

Not allowed:
- modifying invoices  
- modifying line items  

---

## **Consignor**
Allowed:
- `select` invoice_items for items they own  
- Sees buyer username  

Not allowed:
- viewing unrelated invoices  

---

## **Admin**
Allowed:
- full read/write  
- mark invoices as paid/cancelled  

Not allowed:
- editing hammer prices  
- deleting invoices  

---

# **7. UI Pages**

### `/account/invoices`
- List of buyer’s invoices  
- Status indicators  
- Total amount  

### `/account/invoices/[id]`
- Invoice detail  
- Line items  
- Hammer prices  
- Buyer username  

### `/admin/invoices`
- All invoices  
- Filters: unpaid, paid, cancelled  
- Full identity (username + full name)  

---

# **8. Failure & Recovery**

### If invoice generation fails:
- Idempotent retry  
- No duplicates  

### If payment update fails:
- Admin retries  
- No partial state  

---

# **Final Note**

Invoices form the financial backbone of Tartami.  
They connect bidding to payouts and ensure every transaction is auditable, immutable, and transparent.
