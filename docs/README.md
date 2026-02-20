# **Tartami Developer Handbook — Index**

This handbook is the **single source of truth** for building Tartami.  
Every file is modular, explicit, and designed for solo‑developer execution.

---

# **1. System Philosophy**
**File:** `system_philosophy.md`  
Defines the worldview, invariants, and non‑negotiable rules that govern Tartami.  
Explains *why* the system works the way it does.

---

# **2. Product & Architecture**
| Topic | File |
|-------|------|
| Product Overview | `product.md` |
| System Architecture | `architecture.md` |
| Database Overview | `database.md` |
| Row‑Level Security Model | `rls.md` |
| Build Roadmap (10 Weeks) | `roadmap.md` |

These files define *what* Tartami is and *how* it is structured.

---

# **3. Modules (Feature‑Level Documentation)**  
Each module contains tables, RLS rules, workflows, UI pages, server actions, and admin tools.

| Module | File |
|--------|------|
| Users & Profiles | `modules/users.md` |
| Auctions | `modules/auctions.md` |
| Items & Submissions | `modules/items.md` |
| Bidding | `modules/bidding.md` |
| Invoices & Payments | `modules/invoices.md` |
| Settlement & Payouts | `modules/payouts.md` |
| Notifications | `modules/notifications.md` |
| Admin Console | `modules/admin.md` |

Each module is **self‑contained** and maps directly to the code you will write.

---

# **4. Database Implementation (Supabase SQL)**  
These files are applied directly in Supabase.

| File | Description |
|------|-------------|
| `schema.sql` | Full schema: tables, relationships, indexes |
| `rls.sql` | All row‑level security policies |
| `functions.sql` | Core RPC functions (place_bid, generate_invoices, settle_auction) |
| `triggers.sql` | Audit logs, notifications, soft‑close protection |

The database is the **authoritative engine** of Tartami.

---

# **5. Application Structure (Next.js)**

| Folder | Description |
|--------|-------------|
| `/app` | Next.js App Router (routing, layouts, server actions) |
| `/lib` | Supabase clients, queries, validation, utilities |
| `/components` | UI components (module‑based) |

This structure keeps the codebase clean, modular, and scalable.

---

# **6. How to Use This Handbook**

1. **Start with `system_philosophy.md`**  
   Understand the invariants and worldview.

2. **Read `product.md` and `architecture.md`**  
   Build the mental model.

3. **Review the database schema (`schema.sql`)**  
   The database is the source of truth.

4. **Understand access control (`rls.md`)**  
   RLS defines what is possible.

5. **Follow the roadmap (`roadmap.md`)**  
   Build Tartami in the correct order.

6. **Implement module by module (`/modules/*`)**  
   Each module is self‑contained and maps directly to code.

7. **Use `/lib` and `/components` as your coding blueprint**  
   Ensures consistency and maintainability.

---

# **7. Document Hierarchy**

To avoid confusion:

- **System Philosophy** → *Why the system works this way*  
- **Developer Handbook** → *How the system works*  
- **Database SQL** → *The implementation of the rules*  
- **Next.js App** → *The interface to the rules*

---

# **8. Versioning**

This handbook is versioned alongside the codebase.  
Any change to the system philosophy requires explicit justification and approval.

---
