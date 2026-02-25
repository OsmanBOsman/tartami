-- ============================================
-- Tartami: User Profiles Table (Final Identity Model)
-- ============================================

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Real identity (admin-only)
  full_name text,
  phone text,

  -- Public identity
  username text unique,

  -- Location (East Africa friendly)
  city text,
  neighborhood text,
  country text,

  -- Profile
  avatar_url text,

  -- Trust & Access
  approved boolean default false,
  trusted boolean default false,
  banned boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Automatically update updated_at on changes
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at
before update on public.user_profiles
for each row
execute procedure public.handle_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

alter table public.user_profiles enable row level security;

-- Users can view their own profile
create policy "Users can view their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

-- Users can update their own profile (with restrictions)
create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (
    auth.uid() = id
    and banned = false
  )
  with check (
    -- Users cannot change full_name or phone after approval
    (old.approved = false)
    or (
      new.full_name = old.full_name
      and new.phone = old.phone
    )
  );

-- Users can insert their own profile
create policy "Users can insert their own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);

-- Admins can do everything
create policy "Admins have full access"
  on public.user_profiles
  for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
