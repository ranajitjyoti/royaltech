create table if not exists public.catalog_overrides (
    product_key text primary key,
    name text not null check (char_length(trim(name)) between 1 and 120),
    price numeric(10, 2) not null check (price >= 0),
    available boolean not null default true,
    updated_at timestamptz not null default now()
);

alter table public.catalog_overrides
    add column if not exists image_url text not null default '',
    add column if not exists category text not null default 'Products';

alter table public.catalog_overrides enable row level security;

grant select on public.catalog_overrides to anon, authenticated;
grant insert, update, delete on public.catalog_overrides to authenticated;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'catalog_overrides'
          and policyname = 'Catalog overrides are public to read'
    ) then
        execute $policy$
            create policy "Catalog overrides are public to read"
                on public.catalog_overrides
                for select
                to anon, authenticated
                using (true)
        $policy$;
    end if;
end
$$;

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
