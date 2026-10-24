-- Run this in Supabase SQL Editor

create table if not exists public.catalog_products (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(trim(name)) between 1 and 120),
    description text not null default '',
    price numeric(10, 2) not null check (price >= 0),
    category text not null default 'Products',
    image_url text not null default '',
    available boolean not null default true,
    page text not null check (page in ('cakes', 'order-cakes', 'both')),
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.catalog_products enable row level security;

grant select on public.catalog_products to anon, authenticated;
grant insert, update, delete on public.catalog_products to authenticated;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='catalog_products' and policyname='Products are public to read') then
        execute $p$ create policy "Products are public to read" on public.catalog_products for select to anon, authenticated using (true) $p$;
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='catalog_products' and policyname='Admin can manage products') then
        execute $p$ create policy "Admin can manage products" on public.catalog_products for all to authenticated using (lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com') with check (lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com') $p$;
    end if;
end
$$;

-- Storage bucket for product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 512000, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- Storage RLS
do $$
begin
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Product images are public') then
        execute $p$ create policy "Product images are public" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images') $p$;
    end if;
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Admin can upload product images') then
        execute $p$ create policy "Admin can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com') $p$;
    end if;
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Admin can delete product images') then
        execute $p$ create policy "Admin can delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com') $p$;
    end if;
end
$$;
