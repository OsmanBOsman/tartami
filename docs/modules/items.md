# **Items Module**

This module defines how items are submitted, approved, assigned to auctions, displayed to bidders, and settled for consignors.  
Tartami uses **item‑level consignors only** — never auction‑level consignors — and **does not support reserve prices**.  
Every item must have a **starting_bid**, and bidding is increment‑only.

---

# **1. Table Definitions**

## **items**
Stores all approved items that can be assigned to auctions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Item ID |
| `consignor_id` | uuid (FK → user_profiles.id) | Owner of the item |
| `auction_id` | uuid (FK → auctions.id, nullable) | Assigned auction |
| `title` | text | Item title |
| `description` | text | Full description |
| `starting_bid` | numeric | Required. Tartami uses starting_bid only — **no reserves** |
| `images` | text[] | Array of image URLs |
| `status` | enum(`pending`, `approved`, `rejected`) | Admin‑controlled |
| `created_at` | timestamptz | Submission timestamp |
| `updated_at` | timestamptz | Auto‑updated |

---

## **item_submissions**
Raw submissions before admin approval.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Submission ID |
| `user_id` | uuid (FK → user_profiles.id) | Consignor submitting |
| `title` | text | Proposed title |
| `description` | text | Proposed description |
| `starting_bid` | numeric | Required |
| `images` | text[] | Uploaded images |
| `status` | enum(`pending`, `approved`, `rejected`) | Admin review state |
| `admin_note` | text | Reason for rejection |
| `created_at` | timestamptz | Timestamp |

---

# **2. Workflow**

## **A. Submission Flow**
1. Consignor submits item via `/submissions/new`  
2. Item enters `item_submissions` with status `pending`  
3. Admin reviews submission:  
   - Approve → moves to `items` table  
   - Reject → stays in submissions with `admin_note`  
4. Approved items can be assigned to auctions  

---

## **B. Auction Assignment**
- Admin assigns approved items to an auction  
- Items cannot be assigned if:  
  - status ≠ `approved`  
  - auction is `live` or `ended`  
- Items can be unassigned only while auction is `draft` or `scheduled`  

---

## **C. Visibility Rules**
### **Public**
- Sees items only for:  
  - scheduled auctions  
  - live auctions  
  - ended auctions  
- Sees:  
  - title  
  - description  
  - images  
  - starting_bid  
  - current price  
  - **bidding history (username + amount + timestamp)**

### **Consignor**
- Sees:  
  - all their own items  
  - full bidding history on their items  
  - **bidder usernames** (never masked)  
  - hammer prices  
  - settlement status  

### **Admin**
- Sees everything  
- Can view bidder full names only in admin tools (never in public UI)

---

# **3. RLS Rules**

## **items**

### **Public**
- `select` items for visible auctions (scheduled, live, ended)

### **Consignor**
- `select` items they own  
- Cannot update after approval  
- Cannot assign to auctions  

### **Admin**
- Full read/write  
- Approves submissions  
- Assigns items to auctions  

---

## **item_submissions**

### **Consignor**
- `insert` new submissions  
- `select` their own submissions  
- Cannot approve or reject  
- Cannot modify after approval  

### **Admin**
- Full read/write  
- Approves or rejects submissions  
- Moves approved submissions into `items`  

---

# **4. Admin Tools**

### `/admin/submissions`
- View pending submissions  
- Approve / reject  
- Add admin notes  

### `/admin/items`
- View all items  
- Assign items to auctions  
- Unassign (only if auction not live)  

---

# **5. UI Pages**

### `/submissions/new`
- Form for consignors  
- Upload images  
- Enter title, description, starting_bid  

### `/items/[id]`
- Public item detail page  
- Shows:  
  - title  
  - description  
  - starting_bid  
  - images  
  - **bidding history (username only)**  
  - current price  

### `/admin/items`
- Admin list view  
- Filters: pending, approved, assigned, unassigned  

---

# **6. Invariants**

These rules cannot be broken:

### **Item Invariants**
- No reserve prices — **starting_bid only**  
- Items belong to a single consignor  
- Items cannot be edited after approval  
- Items cannot be assigned to a live or ended auction  
- Items cannot be deleted once bidding has occurred  

### **Auction Invariants**
- Items must be approved before assignment  
- Items cannot move between auctions once bidding starts  

### **Identity Invariants**
- **Public sees bidder usernames**  
- **Consignors see bidder usernames**  
- **Admins see bidder usernames + full names in admin tools**  
- **No masking, aliasing, or anonymization exists anywhere**  

---

# **7. Settlement Logic (Item‑Level)**

After auction ends:

1. Winning bid becomes hammer price  
2. Item contributes a line item to the bidder’s invoice  
3. After invoice is fully paid:  
   - Item contributes to consignor payout  
4. Payout amounts are immutable once created  

---

# **8. Failure & Recovery**

### If item submission fails:
- User retries  
- No partial records  

### If admin approves twice:
- Idempotent logic prevents duplicates  

### If auction assignment fails:
- Item remains unassigned  
- No partial state  

---

# **Final Note**

This module is the backbone of Tartami’s item‑level consignor model.  
It enforces transparency, fairness, and cultural authenticity by eliminating reserve prices and ensuring every item follows a predictable, auditable lifecycle.

---
