# 👤 **Users & Auth Module**

The Users & Auth module defines identity, approval, masking, and administrative access.  
It is the foundation of all other modules.

---

## 📦 **Tables**

### **user_profiles**
Stores all user‑level metadata:

- `id` (PK, matches auth.users)
- `full_name`
- `phone`
- `is_approved` (boolean)
- `is_admin` (boolean)
- `mask_identity` (boolean)
- `created_at`
- `updated_at`

---

## ⭐ **Features**

### **1. Sign Up / Sign In**
- Supabase Auth handles email/password or OAuth  
- On first login, a `user_profiles` row is created  
- User is **not approved** by default  

### **2. Profile Editing**
Users can update:

- name  
- phone  
- masking preference  

Admins can update:

- approval status  
- admin flag  
- any profile field  

### **3. Mask Identity Toggle**
Users can toggle:

- **mask_identity = true/false**

Masking affects:

- bidding UI  
- auction pages  
- consignor views  

Admins always see real identity.

### **4. Admin Flag**
Admins have elevated access but are **bounded**:

- cannot bypass RLS  
- cannot impersonate users  
- cannot modify financial records  
- cannot override hammer prices  

---

## 🧭 **Pages**

### **/account/profile**
- View/edit profile  
- Toggle masking  
- Show approval status  
- Redirect unapproved users away from bidding pages  

### **/admin/users**
- List all users  
- Approve bidders  
- Promote/demote admins  
- View masking preference  
- View activity logs (future)  

---

## 🔐 **RLS Rules**

### **User**
- `select` own row  
- `update` own row (except admin fields)

### **Admin**
- `select` all rows  
- `update` all rows  
- Cannot bypass masking in UI  
- Cannot modify financial logic  

### **Public**
- No access  

---

## 🧱 **Module Dependencies**

This module must be completed before:

- Auctions  
- Items  
- Bidding  
- Invoices  
- Payments  
- Settlement  
- Admin Console  

Because all modules depend on:

- identity  
- approval  
- masking  
- admin boundaries  

---

## 🛠 **Implementation Notes**

- Create `user_profiles` via trigger on `auth.users`  
- Add RLS policies for user/admin separation  
- Add server actions for profile updates  
- Add admin‑only server actions for approvals  
- Add middleware to protect `/app` routes  
- Add redirect for unapproved users  

---


**“Let’s write the Auctions module.”**

And we’ll continue building the system layer by layer.
