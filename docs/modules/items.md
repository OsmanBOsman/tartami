# 📦 **Items & Submissions Module**

The Items & Submissions module defines how consignors submit items, how admins approve them, and how items enter auctions.  
This module sits between **Users** and **Auctions**, and is required before bidding can exist.

---

## 🗄️ **Tables**

### **1. item_submissions**
Raw submissions from consignors.

Fields include:

- `id`
- `user_id` (consignor)
- `title`
- `description`
- `images`
- `category`
- `reserve_price` (optional, but Tartami uses *starting_bid* only — no reserves)
- `status` (pending, approved, rejected)
- `admin_id` (who approved/rejected)
- `created_at`
- `updated_at`

### **2. items**
Approved items ready for auction assignment.

Fields include:

- `id`
- `submission_id`
- `consignor_id`
- `auction_id` (nullable until assigned)
- `title`
- `description`
- `images`
- `starting_bid`
- `status` (approved, assigned, sold, unsold)
- `created_at`
- `updated_at`

---

## 🔄 **Flow**

### **1. User submits item**
- Form at `/submissions/new`
- Creates a row in `item_submissions`
- Status = `pending`
- Admin notified

### **2. Admin approves**
- Admin reviews submission in `/admin/submissions`
- Approves or rejects
- If approved:
  - A new row is created in `items`
  - `item_submissions.status = approved`

### **3. Admin assigns item to auction**
- Admin selects an auction
- Assigns item to that auction
- Item becomes visible on `/auctions/[id]`

---

## 🧭 **Pages**

### **/submissions/new**
- Consignor submits item  
- Upload images  
- Provide details  
- See submission status  

### **/admin/submissions**
- Admin reviews pending submissions  
- Approves or rejects  
- Views submission history  

---

## 🔐 **RLS Rules**

### **Consignor**
- `select` their own submissions  
- `insert` new submissions  
- `select` their own items  
- Cannot modify items after approval  
- Cannot assign items to auctions  

### **Public**
- Can `select` items only after they are assigned to a visible auction  

### **Admin**
- Full read/write on:
  - `item_submissions`
  - `items`
- Cannot delete items  
- Cannot modify financial fields after auction ends  

---

## 🧱 **Module Dependencies**

### **Depends on:**
- Users & Auth (for consignor identity)
- Admin role (for approvals)

### **Required before:**
- Auctions module  
- Bidding module  
- Invoices module  

Because items must exist and be approved before they can be auctioned or bid on.

---

## 🛠 **Implementation Notes**

- Use a server action for item submission  
- Use admin‑only server actions for approvals  
- Use a clean separation:
  - `item_submissions` = raw, editable  
  - `items` = approved, immutable except auction assignment  
- Add triggers to sync submission → item creation  
- Add audit logs for admin approvals  

---

# ⭐ What you’ve completed  
You now have:

- Users module  
- Items & Submissions module  

This means you’ve completed **2 out of 8** modules.

---
