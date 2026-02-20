Tartami Developer Handbook — Index
Welcome to the Tartami Developer Handbook.
 This directory contains all technical documentation required to build, maintain, and extend the Tartami auction platform.
This handbook is structured so a solo developer can build Tartami confidently and without confusion.

⭐ 0. System Philosophy (Start Here)
system_philosophy.md
This is the constitution of Tartami.
 It defines:
the worldview of the system
the non‑negotiable invariants
the financial rules
the identity rules
the admin boundaries
the architectural philosophy
the build order
the failure‑recovery model
If the implementation ever contradicts this document, the implementation is wrong.
Read this first.

1. Core Documentation
File
Description
product.md
What Tartami is, who it serves, and the core product philosophy.
architecture.md
System design, domains, rendering strategy, logic boundaries.
database.md
Human‑readable schema overview and relationships.
rls.md
Access control model and RLS rules.
roadmap.md
10‑week build plan for the full platform.


2. Module Specifications
Each module contains tables, RLS rules, workflows, UI pages, server actions, and admin tools.
Module
File
Users & Profiles
modules/users.md
Auctions
modules/auctions.md
Items
modules/items.md
Bidding
modules/bidding.md
Invoices
modules/invoices.md
Payouts
modules/payouts.md
Notifications
modules/notifications.md
Admin Console
modules/admin.md


3. Database Implementation
These files are applied directly in Supabase.
File
Description
schema.sql
Full schema: tables, relationships, indexes.
rls.sql
All row‑level security policies.
functions.sql
Core RPC functions (place_bid, generate_invoices, settle_auction).
triggers.sql
Audit logs, notifications, soft‑close protection.


4. Application Structure
Folder
Description
/app
Next.js App Router (routing, layouts, server actions).
/lib
Supabase clients, queries, validation, utilities.
/components
UI components (module‑based).


5. How to Use This Handbook
Start with system_philosophy.md
 Understand the invariants and worldview.
Read product.md and architecture.md
 Build the mental model.
Review the database schema (schema.sql)
 The database is the source of truth.
Understand access control (rls.md)
 RLS defines what is possible.
Follow the roadmap (roadmap.md)
 Build Tartami in the correct order.
Implement module by module using /modules/*
 Each module is self‑contained.
Use /lib and /components structures as your coding blueprint
 This keeps the codebase clean and scalable.

6. Philosophy
Tartami is built on:
privacy
trust
cultural authenticity
fairness
transparency
This documentation ensures those values are reflected in every technical decision.

7. Document Hierarchy
To avoid confusion:
System Philosophy = Why the system works this way
Developer Handbook = How the system works
Database SQL = The implementation of the rules
Next.js App = The interface to the rules

8. Versioning
This handbook is versioned alongside the codebase.
 Changes to the system philosophy require explicit approval and justification.

