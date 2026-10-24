create table if not exists public.catalog_overrides (
    product_key text primary key,
    name text not null check (char_length(trim(name)) between 1 and 120),
    price numeric(10, 2) not null check (price >= 0),
    available boolean not null default true,
    updated_at timestamptz not null default now()
);

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

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'catalog_overrides'
          and policyname = 'Admin can insert catalog overrides'
    ) then
        execute $policy$
            create policy "Admin can insert catalog overrides"
                on public.catalog_overrides
                for insert
                to authenticated
                with check (lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com')
        $policy$;
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'catalog_overrides'
          and policyname = 'Admin can update catalog overrides'
    ) then
        execute $policy$
            create policy "Admin can update catalog overrides"
                on public.catalog_overrides
                for update
                to authenticated
                using (lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com')
                with check (lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com')
        $policy$;
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'catalog_overrides'
          and policyname = 'Admin can delete catalog overrides'
    ) then
        execute $policy$
            create policy "Admin can delete catalog overrides"
                on public.catalog_overrides
                for delete
                to authenticated
                using (lower(auth.jwt() ->> 'email') = 'ranojitjyoti@gmail.com')
        $policy$;
    end if;
end
$$;
