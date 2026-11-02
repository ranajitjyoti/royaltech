-- Run this in the Supabase SQL Editor to authorize the additional catalog admin.
-- Keep the email allow-list in sync with ADMIN_EMAILS in catalog-manager.js.

-- The catalog manager reads and writes these columns, including on older installs.
alter table public.catalog_overrides
    add column if not exists image_url text not null default '',
    add column if not exists category text not null default 'Products';

drop policy if exists "Admin can insert catalog overrides" on public.catalog_overrides;
create policy "Admin can insert catalog overrides"
    on public.catalog_overrides
    for insert
    to authenticated
    with check (lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com'));

drop policy if exists "Admin can update catalog overrides" on public.catalog_overrides;
create policy "Admin can update catalog overrides"
    on public.catalog_overrides
    for update
    to authenticated
    using (lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com'))
    with check (lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com'));

drop policy if exists "Admin can delete catalog overrides" on public.catalog_overrides;
create policy "Admin can delete catalog overrides"
    on public.catalog_overrides
    for delete
    to authenticated
    using (lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com'));

drop policy if exists "Admin can upload product images" on storage.objects;
create policy "Admin can upload product images"
    on storage.objects
    for insert
    to authenticated
    with check (
        bucket_id = 'product-images'
        and lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com')
    );

drop policy if exists "Admin can update product images" on storage.objects;
create policy "Admin can update product images"
    on storage.objects
    for update
    to authenticated
    using (
        bucket_id = 'product-images'
        and lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com')
    )
    with check (
        bucket_id = 'product-images'
        and lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com')
    );

drop policy if exists "Admin can delete product images" on storage.objects;
create policy "Admin can delete product images"
    on storage.objects
    for delete
    to authenticated
    using (
        bucket_id = 'product-images'
        and lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com')
    );
