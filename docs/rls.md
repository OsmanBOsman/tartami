Row‑Level Security Rules
General
RLS enabled on all tables
Default: no access
user_profiles
user: select/update own
admin: select/update all
auctions
public: select scheduled/live/ended
admin: full access
items
public: select items for visible auctions
consignor: select items they own
admin: full access
bids
bidder: insert if approved
bidder: select masked bids
consignor: select masked bids on their items
admin: full identity
invoices/payments
bidder: only their own
admin: full
consignor_payouts
consignor: only their payouts
admin: full
audit_logs
only admins can read
everyone can insert (via backend)
