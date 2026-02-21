-- ============================================
-- Tartami: User Profiles Table (Extended)
-- ============================================

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  username text unique,
  phone text,
  country text,
  avatar_url text,

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

create policy "Users can view their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);
