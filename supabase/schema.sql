-- Run this SQL in Supabase Dashboard -> SQL Editor.
-- This table is written by trusted Next.js server routes using the service-role key.
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  email text,
  user_id uuid,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  notes text,
  items jsonb not null default '[]'::jsonb,
  total_amount integer not null check (total_amount > 0),
  currency text not null default 'INR',
  payment_method text not null check (payment_method in ('cod','razorpay')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'new' check (order_status in ('new','confirmed','processing','shipped','delivered','cancelled','payment_setup_error')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_phone_idx on public.orders (phone);
create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_user_id_idx on public.orders (user_id);

alter table public.orders enable row level security;

-- Do not create a public INSERT/SELECT policy for orders.
-- Server API uses SUPABASE_SERVICE_ROLE_KEY and bypasses RLS.
-- Never expose that key to the browser. Add an authenticated admin policy only
-- if you implement Supabase Auth for the admin dashboard.

-- Admin-managed product catalogue
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text unique not null,
 price integer not null check(price > 0),
 compare_at integer,
 category text not null check(category in ('LED Mirror','Wall Mirror','Full-Length Mirror')),
 shape text not null check(shape in ('arch','round','rect','full')),
 badge text,
 dimensions text default '24 × 36 inches',
 glass_specs text default '5mm Saint-Gobain Float Glass',
 mounting text default 'Heavy-Duty French Cleat Included',
 lighting_specs text default 'Warm & Cool LED Dimmer',
 warranty text default '5-Year Structural & LED Warranty',
 description text not null default '',
 image_url text,
 images text[] default '{}'::text[],
 led boolean not null default false,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists "Allow public read active products" on public.products;
create policy "Allow public read active products" on public.products for select using (true);

-- Customer Saved Delivery Addresses
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  name text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  label text default 'Home',
  is_default boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_id_idx on public.customer_addresses (user_id);
create index if not exists customer_addresses_email_idx on public.customer_addresses (email);

alter table public.customer_addresses enable row level security;
drop policy if exists "Allow public read/write addresses through service role" on public.customer_addresses;
create policy "Allow public read/write addresses through service role" on public.customer_addresses for all using (true);


