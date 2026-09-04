create table if not exists public.products (
  id bigint primary key,
  name text not null,
  slug text,
  price integer not null,
  original_price integer,
  tag text,
  description text not null,
  source text,
  length text,
  volume text,
  fitting text,
  collection text,
  whatsapp text,
  gradient text,
  image text,
  images text[],
  instagram_link text,
  sort_order integer default 0,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_visible_sort_idx
  on public.products (is_deleted, sort_order, id);

create or replace function public.set_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

alter table public.products enable row level security;

drop policy if exists "Products are readable by everyone" on public.products;
create policy "Products are readable by everyone"
on public.products
for select
using (true);

-- Keep writes private. The Vercel API functions use SUPABASE_SERVICE_ROLE_KEY
-- to create, update, reorder, and soft-delete products after admin validation.
-- Create a public Supabase Storage bucket named "product-images" for product photos.
