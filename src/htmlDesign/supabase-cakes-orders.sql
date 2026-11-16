create table if not exists public.cakes_orders (
    id uuid primary key default gen_random_uuid(),
    items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 200),
    subtotal numeric(12, 2) not null check (subtotal >= 0),
    delivery_charge numeric(12, 2) not null check (delivery_charge >= 0),
    total numeric(12, 2) not null check (total = subtotal + delivery_charge),
    has_unpriced_items boolean not null default false,
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
    created_at timestamptz not null default now(),
    read_at timestamptz
);

alter table public.cakes_orders enable row level security;
revoke all on public.cakes_orders from anon, authenticated;
grant select, update on public.cakes_orders to authenticated;
grant all on public.cakes_orders to service_role;

create index if not exists cakes_orders_created_at_idx on public.cakes_orders (created_at desc);
create index if not exists cakes_orders_unread_idx on public.cakes_orders (created_at desc) where read_at is null;

drop policy if exists "Cakes admins can read orders" on public.cakes_orders;
create policy "Cakes admins can read orders"
    on public.cakes_orders
    for select
    to authenticated
    using (lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com'));

drop policy if exists "Cakes admins can mark orders read" on public.cakes_orders;
create policy "Cakes admins can mark orders read"
    on public.cakes_orders
    for update
    to authenticated
    using (lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com'))
    with check (lower(auth.jwt() ->> 'email') in ('ranojitjyoti@gmail.com', 'connect@deeplinkdata.com'));

create table if not exists public.cakes_order_push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    endpoint text not null unique,
    p256dh text not null,
    auth_key text not null,
    created_at timestamptz not null default now()
);

alter table public.cakes_order_push_subscriptions enable row level security;
revoke all on public.cakes_order_push_subscriptions from anon, authenticated;
grant all on public.cakes_order_push_subscriptions to service_role;

create table if not exists public.cakes_order_rate_limits (
    ip_hash text primary key,
    window_started_at timestamptz not null,
    request_count integer not null check (request_count > 0)
);

alter table public.cakes_order_rate_limits enable row level security;
revoke all on public.cakes_order_rate_limits from anon, authenticated;
grant all on public.cakes_order_rate_limits to service_role;

create index if not exists cakes_order_rate_limits_window_idx
    on public.cakes_order_rate_limits (window_started_at);

create or replace function public.consume_cakes_order_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    current_window timestamptz := date_trunc('minute', now());
    current_count integer;
begin
    delete from public.cakes_order_rate_limits
    where window_started_at < now() - interval '1 day';

    insert into public.cakes_order_rate_limits (ip_hash, window_started_at, request_count)
    values (p_ip_hash, current_window, 1)
    on conflict (ip_hash) do update
    set window_started_at = case
            when public.cakes_order_rate_limits.window_started_at < current_window then current_window
            else public.cakes_order_rate_limits.window_started_at
        end,
        request_count = case
            when public.cakes_order_rate_limits.window_started_at < current_window then 1
            else public.cakes_order_rate_limits.request_count + 1
        end
    returning request_count into current_count;

    return current_count <= 5;
end;
$$;

revoke all on function public.consume_cakes_order_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_cakes_order_rate_limit(text) to service_role;

do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'cakes_orders'
    ) then
        alter publication supabase_realtime add table public.cakes_orders;
    end if;
end;
$$;
