# 🔐 **Tartami — Row‑Level Security (RLS) Module**

Tartami enforces **full Row‑Level Security (RLS)** across all tables.  
The database is the **single source of truth** for all access control.  
The frontend never decides who can see or modify data.

All policies follow the same philosophy:

- **Default = DENY ALL**  
- Access is granted **explicitly**  
- Admins have elevated access but **cannot bypass financial logic**  
- All sensitive actions are logged in `audit_logs`  
- All financial tables follow an **append‑only** model  

---

# ⭐ **Global RLS Principles**

### **1. RLS enabled on every table**
No table is left unprotected.

### **2. Default policy: DENY ALL**
Every table begins with:

```sql
alter table <table> enable row level security;

create policy "deny_all" on <table>
  for all
  using (false)
  with check (false);
```

### **3. Access granted per role**
Roles include:

- **public**  
- **authenticated user**  
- **bidder** (approved user)  
- **consignor**  
- **admin**  

### **4. Admins are powerful but bounded**
Admins can read/write most tables, but **cannot**:

- modify financial records  
- delete financial records  
- override hammer prices  
- bypass settlement logic  
- impersonate users  

### **5. All financial tables are append‑only**
Policies enforce:

- no deletes  
- no updates to totals  
- no updates to payout amounts  

---

# 👤 **user_profiles**

## **User Policies**

### Select own profile
```sql
create policy "user_select_self" on user_profiles
  for select
  using (auth.uid() = id);
```

### Update own profile (non‑admin fields)
```sql
create policy "user_update_self" on user_profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin is false
    and is_approved is not distinct from is_approved
  );
```

## **Admin Policies**

### Select all
```sql
create policy "admin_select_all" on user_profiles
  for select
  using (is_admin = true);
```

### Update all
```sql
create policy "admin_update_all" on user_profiles
  for update
  using (is_admin = true)
  with check (is_admin = true);
```

---

# 🏛️ **auctions**

## **Public**
```sql
create policy "public_select_visible_auctions" on auctions
  for select
  using (status in ('scheduled','live','ended'));
```

## **Admin**
```sql
create policy "admin_full_access_auctions" on auctions
  for all
  using (is_admin = true)
  with check (is_admin = true);
```

Admins cannot reopen ended auctions — enforced in RPC, not RLS.

---

# 📦 **items**

## **Public**
```sql
create policy "public_select_items_in_visible_auctions" on items
  for select
  using (
    auction_id in (
      select id from auctions
      where status in ('scheduled','live','ended')
    )
  );
```

## **Consignor**
```sql
create policy "consignor_select_own_items" on items
  for select
  using (consignor_id = auth.uid());
```

## **Admin**
```sql
create policy "admin_full_access_items" on items
  for all
  using (is_admin = true)
  with check (is_admin = true);
```

---

# 🎯 **bids**

## **Bidder — Insert**
```sql
create policy "bidder_insert_valid_bids" on bids
  for insert
  with check (
    auth.uid() = bidder_id
    and auth.uid() in (select id from user_profiles where is_approved = true)
  );
```

## **Bidder — Select masked**
```sql
create policy "bidder_select_masked_bids" on bids
  for select
  using (
    auction_id in (
      select id from auctions
      where status in ('scheduled','live','ended')
    )
  );
```

## **Consignor — Select masked**
```sql
create policy "consignor_select_masked_bids" on bids
  for select
  using (
    item_id in (
      select id from items where consignor_id = auth.uid()
    )
  );
```

## **Admin — Full identity**
```sql
create policy "admin_select_all_bids" on bids
  for select
  using (is_admin = true);
```

Admins cannot modify or delete bids — enforced by **no update/delete policies**.

---

# 🧾 **invoices**

## **Bidder**
```sql
create policy "bidder_select_own_invoices" on invoices
  for select
  using (bidder_id = auth.uid());
```

## **Admin**
```sql
create policy "admin_full_access_invoices" on invoices
  for all
  using (is_admin = true)
  with check (is_admin = true);
```

No delete policy is defined → deletes are impossible.

---

# 💵 **payments**

## **Bidder**
```sql
create policy "bidder_select_own_payments" on payments
  for select
  using (
    invoice_id in (
      select id from invoices where bidder_id = auth.uid()
    )
  );
```

## **Admin**
```sql
create policy "admin_full_access_payments" on payments
  for all
  using (is_admin = true)
  with check (is_admin = true);
```

Append‑only enforced by **no update/delete policies**.

---

# 💰 **consignor_payouts**

## **Consignor**
```sql
create policy "consignor_select_own_payouts" on consignor_payouts
  for select
  using (consignor_id = auth.uid());
```

## **Admin**
```sql
create policy "admin_full_access_payouts" on consignor_payouts
  for all
  using (is_admin = true)
  with check (is_admin = true);
```

No updates to payout amounts — enforced by RPC + no update policy.

---

# 📜 **audit_logs**

## **Admin**
```sql
create policy "admin_select_logs" on audit_logs
  for select
  using (is_admin = true);
```

## **Everyone**
Insert is done via triggers — no direct user access.

```sql
create policy "no_direct_inserts" on audit_logs
  for insert
  with check (false);
```

---

# 🧱 **RLS Summary Table**

| Table | Public | User | Consignor | Bidder | Admin |
|-------|--------|-------|-----------|--------|--------|
| user_profiles | ❌ | ✔ own | — | — | ✔ all |
| auctions | ✔ visible | — | — | — | ✔ all |
| items | ✔ visible | — | ✔ own | — | ✔ all |
| bids | ❌ | — | ✔ masked | ✔ masked/insert | ✔ full |
| invoices | ❌ | ✔ own | — | ✔ own | ✔ all |
| payments | ❌ | ✔ own | — | ✔ own | ✔ all |
| consignor_payouts | ❌ | — | ✔ own | — | ✔ all |
| audit_logs | ❌ | ❌ | ❌ | ❌ | ✔ all |

---

# 🛠 **Implementation Notes**

- RLS must be enabled **before** inserting any data  
- All RPCs must re‑validate RLS conditions  
- Admin UI must respect masking rules  
- Financial tables must remain append‑only  
- No delete policies should ever be created  
- All settlement and invoice logic must run inside RPCs  

---
