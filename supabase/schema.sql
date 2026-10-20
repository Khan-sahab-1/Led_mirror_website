-- Run this SQL in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

-- 1. Orders Table
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
drop policy if exists "Service role orders access" on public.orders;
create policy "Service role orders access" on public.orders for all using (true);

-- 2. Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price integer not null check(price > 0),
  compare_at integer,
  category text not null check(category in ('LED Mirror','Wall Mirror','Full-Length Mirror')),
  shape text not null check(shape in ('arch','round','rect','full','organic')),
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
drop policy if exists "Allow service role all products" on public.products;
create policy "Allow service role all products" on public.products for all using (true);

-- 3. Customer Saved Delivery Addresses Table
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
drop policy if exists "Allow address access" on public.customer_addresses;
create policy "Allow address access" on public.customer_addresses for all using (true);

-- 4. Storage Bucket for Product Image Uploads
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access for product-images" on storage.objects;
create policy "Public Access for product-images" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Service upload for product-images" on storage.objects;
create policy "Service upload for product-images" on storage.objects for insert with check (bucket_id = 'product-images');

-- 5. Seed / Update Products with High-Resolution Mirror Images
insert into public.products (name, slug, price, compare_at, category, shape, badge, dimensions, glass_specs, mounting, lighting_specs, warranty, description, image_url, images, led, active)
values
(
  'Halo Arch LED Mirror',
  'halo-led-arch-mirror',
  8999,
  10999,
  'LED Mirror',
  'arch',
  'Bestseller',
  '24 × 36 inches',
  '5mm Saint-Gobain Float Glass with Shatterproof Vinyl',
  'Heavy-Duty French Cleat Wall Mount Included',
  '3000K-6000K Tri-Color LED with Touch Dimmer',
  '5-Year Replacement Warranty on Frame & LED',
  'Arch-top mirror with a soft LED glow for modern bathrooms and dressing areas.',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'
  ],
  true,
  true
),
(
  'Luna Round Wall Mirror',
  'luna-round-wall-mirror',
  3499,
  4499,
  'Wall Mirror',
  'round',
  'Minimalist',
  '30 inch Diameter (Round)',
  '5mm Saint-Gobain High-Clarity Beveled Float Glass',
  'Dual Precision Keyhole Brackets Included',
  'Natural Optical Reflection (Ambient)',
  '5-Year Moisture & Rust Resistance Warranty',
  'A minimal round mirror that adds light and visual space to your room.',
  'https://images.unsplash.com/photo-1594913785162-e678a0c23ec9?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1594913785162-e678a0c23ec9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
  ],
  false,
  true
),
(
  'Linea Rectangle LED Mirror',
  'linea-rectangle-led-mirror',
  7499,
  8999,
  'LED Mirror',
  'rect',
  'New',
  '24 × 48 inches',
  '5mm Saint-Gobain Distortion-Free Glass with Beveled Edges',
  'Horizontal & Vertical Heavy-Duty French Cleat Included',
  'Circadian Warm-to-Cool Backlight Strip (CRI 95+)',
  '5-Year Full Replacement Guarantee',
  'Clean rectangular design with integrated LED lighting for contemporary interiors.',
  'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'
  ],
  true,
  true
),
(
  'Full-Length Dressing Mirror',
  'full-length-dressing-mirror',
  5999,
  7999,
  'Full-Length Mirror',
  'full',
  'Wardrobe Must',
  '20 × 66 inches (Full Height)',
  '5mm Architectural Float Glass with Copper-Free Backing',
  'Free-standing Kickstand + Anti-Tip Wall Anchor Kit',
  'True-to-Life Natural Reflection',
  '5-Year Structural Frame Warranty',
  'A tall mirror for bedrooms, wardrobes and dressing corners.',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
  ],
  false,
  true
),
(
  'Arcade Decorative Mirror',
  'arcade-decor-wall-mirror',
  4299,
  5499,
  'Wall Mirror',
  'arch',
  'Artisanal',
  '22 × 34 inches',
  '5mm Saint-Gobain Mirror with Hand-Polished Diamond Edge',
  'Heavy-Duty Pre-installed Z-Bar Bracket',
  'Natural Architectural Ambient Reflection',
  '5-Year Finish & Structural Warranty',
  'A refined arched mirror designed for entryways and accent walls.',
  'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80'
  ],
  false,
  true
),
(
  'Glow Premium LED Mirror',
  'glow-premium-led-mirror',
  12499,
  15999,
  'LED Mirror',
  'round',
  'Luxury Atelier',
  '36 inch Large Diameter',
  '5mm Ultra-Clear Saint-Gobain Glass with Anti-Fog Heating Pad',
  'Aircraft-Grade Aluminum Hanging System Included',
  'Ultra-High Lumens 12V Dual LED Ring with Memory Touch Sensor',
  '5-Year Comprehensive Electric & Glass Warranty',
  'A statement LED mirror for premium residential and hospitality interiors.',
  'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ],
  true,
  true
)
on conflict (slug) do update set
  image_url = excluded.image_url,
  images = excluded.images,
  price = excluded.price,
  dimensions = excluded.dimensions,
  glass_specs = excluded.glass_specs;

-- 6. Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';
