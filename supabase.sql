-- ============================================================
-- SOFIA VARELLI FAN SITE — SUPABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS / FANS TABLE (extends Supabase auth.users)
-- ============================================================
create table public.fan_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  fan_id uuid references public.fan_profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly', '3month', '6month')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'pending')),
  price_paid numeric(10,2) not null,
  ccbill_subscription_id text unique,
  ccbill_transaction_id text,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- CONTENT (Photos & Videos uploaded by Sofia)
-- ============================================================
create table public.content (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('photo', 'video')),
  title text,
  description text,
  storage_path text not null,        -- Supabase Storage path
  thumbnail_path text,               -- For videos
  category text default 'All',
  is_locked boolean default true,
  ppv_price numeric(10,2),           -- null = subscription only; set price = pay-per-view
  duration_seconds integer,          -- For videos
  sort_order integer default 0,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CONTENT ACCESS (unlocks via subscription or PPV)
-- ============================================================
create table public.content_access (
  id uuid default uuid_generate_v4() primary key,
  fan_id uuid references public.fan_profiles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  access_type text not null check (access_type in ('subscription', 'ppv', 'bundle')),
  transaction_id uuid,
  granted_at timestamptz default now(),
  unique(fan_id, content_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  fan_id uuid references public.fan_profiles(id) on delete cascade,
  sender text not null check (sender in ('fan', 'sofia')),
  body text,
  locked_media_path text,            -- Sofia attaches locked media to a reply
  locked_media_price numeric(10,2),  -- Price to unlock this message
  is_paid boolean default false,     -- Has fan paid to unlock?
  is_tip boolean default false,
  tip_amount numeric(10,2),
  ccbill_transaction_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- BUNDLES
-- ============================================================
create table public.bundles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric(10,2) not null,
  original_price numeric(10,2),      -- For showing savings
  thumbnail_path text,
  is_active boolean default true,
  expires_at timestamptz,            -- null = no expiry
  created_at timestamptz default now()
);

create table public.bundle_items (
  id uuid default uuid_generate_v4() primary key,
  bundle_id uuid references public.bundles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade
);

create table public.bundle_purchases (
  id uuid default uuid_generate_v4() primary key,
  fan_id uuid references public.fan_profiles(id) on delete cascade,
  bundle_id uuid references public.bundles(id) on delete cascade,
  price_paid numeric(10,2) not null,
  ccbill_transaction_id text,
  purchased_at timestamptz default now()
);

-- ============================================================
-- TIPS
-- ============================================================
create table public.tips (
  id uuid default uuid_generate_v4() primary key,
  fan_id uuid references public.fan_profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  message text,
  content_id uuid references public.content(id),   -- optional: tip on specific content
  ccbill_transaction_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- TRANSACTIONS (master log of every payment)
-- ============================================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  fan_id uuid references public.fan_profiles(id),
  type text not null check (type in ('subscription', 'ppv', 'bundle', 'message_unlock', 'tip')),
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded', 'chargeback')),
  ccbill_transaction_id text unique,
  ccbill_subscription_id text,
  reference_id uuid,                 -- ID of the thing being paid for
  reference_type text,               -- 'content', 'bundle', 'message', 'tip'
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.fan_profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.content enable row level security;
alter table public.content_access enable row level security;
alter table public.messages enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;
alter table public.bundle_purchases enable row level security;
alter table public.tips enable row level security;
alter table public.transactions enable row level security;

-- Fan profiles: users see only their own
create policy "fan_profiles_self" on public.fan_profiles
  for all using (auth.uid() = id);

-- Subscriptions: fan sees their own
create policy "subscriptions_self" on public.subscriptions
  for select using (auth.uid() = fan_id);

-- Content: unlocked content visible to paying fans; all can see metadata
create policy "content_public_meta" on public.content
  for select using (true);

-- Content access: fan sees their own unlocks
create policy "content_access_self" on public.content_access
  for select using (auth.uid() = fan_id);

-- Messages: fan sees only their own thread
create policy "messages_self" on public.messages
  for select using (auth.uid() = fan_id);
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = fan_id);

-- Bundles: all can browse
create policy "bundles_public" on public.bundles
  for select using (is_active = true);

-- Bundle items: all can browse
create policy "bundle_items_public" on public.bundle_items
  for select using (true);

-- Bundle purchases: fan sees their own
create policy "bundle_purchases_self" on public.bundle_purchases
  for select using (auth.uid() = fan_id);

-- Tips: fan sees their own
create policy "tips_self" on public.tips
  for select using (auth.uid() = fan_id);

-- Transactions: fan sees their own
create policy "transactions_self" on public.transactions
  for select using (auth.uid() = fan_id);

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard Storage tab)
-- ============================================================
-- Bucket: "content"  → private (RLS)
-- Bucket: "thumbnails" → public
-- Bucket: "profiles"  → public

-- ============================================================
-- HELPER FUNCTION: check if fan has active subscription
-- ============================================================
create or replace function public.has_active_subscription(p_fan_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.subscriptions
    where fan_id = p_fan_id
      and status = 'active'
      and (ends_at is null or ends_at > now())
  );
$$;

-- ============================================================
-- HELPER FUNCTION: check if fan can access specific content
-- ============================================================
create or replace function public.can_access_content(p_fan_id uuid, p_content_id uuid)
returns boolean
language sql
security definer
as $$
  select
    not c.is_locked   -- free content
    or public.has_active_subscription(p_fan_id)  -- subscriber
    or exists (       -- PPV or bundle unlock
      select 1 from public.content_access
      where fan_id = p_fan_id and content_id = p_content_id
    )
  from public.content c
  where c.id = p_content_id;
$$;