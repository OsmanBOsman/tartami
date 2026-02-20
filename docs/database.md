Database Schema
Tables
user_profiles
auctions
items
item_submissions
bids
invoices
payments
consignor_payouts
notifications
audit_logs
Key Relationships
auction → items
item → bids
auction + bidder → invoice
invoice → payments
item → consignor_payout
Important Notes
No online payments
No deleting invoices/payments
No modifying hammer prices after auction end
All admin actions logged
