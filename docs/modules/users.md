# 👤 **Users & Auth Module**

The Users & Auth Module defines identity, approval, masking, and administrative access.  
It is the foundation of every other module in Tartami.  
All identity logic is **database‑driven**, **RLS‑enforced**, and **append‑only** where applicable.

---

# **1. Table Definitions**

## **user_profiles**
Stores all user‑level metadata. Mirrors `auth.users` but adds application‑specific fields.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK, matches auth.users.id) | User ID |
| `full_name` | text | User’s name |
| `phone` | text | Contact number |
| `is_approved` | boolean | Required for bidding |
| `is_admin` | boolean | Admin privileges |
| `mask_identity` | boolean | Whether to mask identity in auctions |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Auto‑updated |

**Notes:**
- Created automatically via trigger on `auth.users`  
- Approval and admin flags controlled by admins only  

---

# **2. Core Features**

## **1. Sign Up / Sign In**
- Supabase Auth handles email/password or OAuth  
- On first login, a `user_profiles` row is created  
- User is **not approved** by default  
- Unapproved users cannot bid or submit items  

---

## **2. Profile Editing**
Users can update:
- full name  
- phone  
- masking preference  

Admins can update:
- approval status  
- admin flag  
- any profile field  

All updates are RLS‑protected.

---

## **3. Mask Identity Toggle**
Users can toggle:

```
mask_identity = true | false
```

Masking affects:
- bidding UI  
- auction pages  
- consignor views  

Admins always see real identities.  
Masking never affects admin views or financial records.

---

## **4. Admin Flag**
Admins have elevated access but remain **strictly bounded**:

Admins cannot:
- bypass RLS  
- impersonate users  
- modify financial records  
- override hammer prices  
- bypass settlement logic  

Admins can:
- approve users  
- promote/demote admins  
- manage auctions, items, invoices, payouts  
- view audit logs  

---

# **3. Pages**

## **/account/profile**
- View/edit profile  
- Toggle masking  
- Show approval status  
- Redirect unapproved users away from bidding pages  

---

## **/admin/users**
- List all users  
- Approve bidders  
- Promote/demote admins  
- View masking preference  
- View activity logs (future)  

---

# **4. RLS Rules**

## **User**
Allowed:
- `select` own row  
- `update` own row (except admin fields)

Not allowed:
- modifying approval  
- modifying admin flag  
- modifying other users’ profiles  

---

## **Admin**
Allowed:
- `select` all rows  
- `update` all rows  

Boundaries:
- cannot bypass masking in UI  
- cannot modify financial logic  
- cannot impersonate users  

---

## **Public**
- No access  

---

# **5. Invariants**

These rules **cannot be broken**.

### **Identity Invariants**
- Every user must have a `user_profiles` row  
- Approval is required for bidding  
- Masking never affects admin visibility  
- Admin flag cannot be self‑assigned by users  

### **Security Invariants**
- Admins cannot impersonate users  
- Admins cannot bypass RLS  
- All admin actions must be logged  

### **Data Invariants**
- `user_profiles` is the single source of truth for identity  
- No deletion of user profiles (soft‑disable in future)  

---

# **6. Module Dependencies**

This module must be completed before:

- Auctions  
- Items  
- Bidding  
- Invoices  
- Payments  
- Settlement  
- Payouts  
- Notifications  
- Admin Console  

Because all modules depend on:
- identity  
- approval  
- masking  
- admin boundaries  

---

# **7. Implementation Notes**

- Create `user_profiles` via trigger on `auth.users`  
- Add RLS policies for user/admin separation  
- Add server actions for profile updates  
- Add admin‑only server actions for approvals  
- Add middleware to protect `/app` routes  
- Redirect unapproved users away from bidding and submission pages  
- Masking logic must be applied at the UI layer, not the database layer  

---
