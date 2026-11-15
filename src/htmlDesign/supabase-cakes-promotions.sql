create table if not exists public.catalog_promotions (
    promotion_key text primary key check (promotion_key = 'cakes'),
    discount_type text not null check (discount_type = 'percentage'),
    discount_value numeric(5, 2) not null check (discount_value > 0 and discount_value <= 100),
    starts_at timestamptz not null,
    ends_at timestamptz not null,
    enabled boolean not null default false,
    updated_at timestamptz not null default now(),
    check (ends_at > starts_at)
);

alter table public.catalog_promotions enable row level security;

grant select on public.catalog_promotions to anon, authenticated;
grant insert, update on public.catalog_promotions to authenticated;

drop policy if exists "Cakes promotion is public to read" on public.catalog_promotions;
create policy "Cakes promotion is public to read"
    on public.catalog_promotions
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Admins can insert Cakes promotion" on public.catalog_promotions;
create policy "Admins can insert Cakes promotion"
    on public.catalog_promotions
    for insert
    to authenticated
    with check (
        promotion_key = 'cakes'
        and lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com')
    );

drop policy if exists "Admins can update Cakes promotion" on public.catalog_promotions;
create policy "Admins can update Cakes promotion"
    on public.catalog_promotions
    for update
    to authenticated
    using (
        promotion_key = 'cakes'
        and lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com')
    )
    with check (
        promotion_key = 'cakes'
        and lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com')
    );
