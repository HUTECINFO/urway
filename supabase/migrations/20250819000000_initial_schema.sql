create extension if not exists pgcrypto with schema extensions;

create type public.deal_type as enum (
  'TODAY',
  'FLASH',
  'WEEKEND',
  'LONG_HAUL',
  'BEACH',
  'CITY'
);

create type public.status as enum (
  'DISCOVERED',
  'REVIEW',
  'APPROVED',
  'PUBLISHED',
  'EXPIRED',
  'REJECTED'
);

create type public.trip_type as enum (
  'ROUND_TRIP',
  'ONE_WAY'
);

create type public.user_role as enum (
  'USER',
  'ADMIN'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role public.user_role not null default 'USER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_format check (
    email is null
    or (
      char_length(email) between 3 and 320
      and email = btrim(email)
      and email ~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$'
    )
  )
);

create unique index users_email_unique on public.users (lower(email)) where email is not null;
create index users_role_idx on public.users (role);

create table public.airports (
  id uuid primary key default gen_random_uuid(),
  iata text not null unique,
  name text not null,
  city text not null,
  country text not null,
  timezone text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint airports_iata_format check (iata ~ '^[A-Z]{3}$'),
  constraint airports_name_length check (char_length(name) between 2 and 160),
  constraint airports_city_length check (char_length(city) between 1 and 120),
  constraint airports_country_length check (char_length(country) between 2 and 120),
  constraint airports_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint airports_longitude_range check (longitude is null or longitude between -180 and 180)
);

create index airports_active_city_idx on public.airports (city, iata) where active;

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  country text not null,
  slug text not null unique,
  popularity_score numeric(5,2) not null default 0,
  active boolean not null default true,
  airport_code text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destinations_city_length check (char_length(city) between 1 and 120),
  constraint destinations_country_length check (char_length(country) between 2 and 120),
  constraint destinations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint destinations_popularity_score_range check (popularity_score between 0 and 100),
  constraint destinations_airport_code_format check (airport_code is null or airport_code ~ '^[A-Z]{3}$'),
  constraint destinations_image_url_format check (image_url is null or image_url ~ '^https://')
);

create index destinations_active_popularity_idx on public.destinations (popularity_score desc, city) where active;
create index destinations_country_city_idx on public.destinations (country, city) where active;

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  short_copy text not null,
  origin_airport_id uuid not null references public.airports(id) on delete restrict,
  destination_airport_code text not null,
  destination_city text not null,
  destination_country text not null,
  provider text not null,
  provider_reference text not null,
  external_url text not null,
  price numeric(12,2) not null,
  currency text not null default 'MXN',
  normal_price numeric(12,2) not null,
  savings_percentage numeric(5,2) not null,
  trip_type public.trip_type not null,
  departure_date_start date not null,
  departure_date_end date not null,
  return_date_start date,
  return_date_end date,
  duration_days smallint,
  duration_minutes integer not null,
  stops smallint not null default 0,
  airline text not null,
  baggage text,
  image_url text not null,
  deal_type public.deal_type not null,
  score numeric(5,2) not null,
  price_score numeric(5,2) not null,
  savings_score numeric(5,2) not null,
  destination_score numeric(5,2) not null,
  date_score numeric(5,2) not null,
  flight_quality_score numeric(5,2) not null,
  status public.status not null default 'DISCOVERED',
  detected_at timestamptz not null default now(),
  verified_at timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  fingerprint text not null unique,
  views bigint not null default 0,
  affiliate_revenue numeric(12,2) not null default 0,
  bookings integer not null default 0,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deals_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint deals_title_length check (char_length(title) between 5 and 180),
  constraint deals_description_length check (char_length(description) between 20 and 5000),
  constraint deals_short_copy_length check (char_length(short_copy) between 10 and 280),
  constraint deals_destination_airport_code_format check (destination_airport_code ~ '^[A-Z]{3}$'),
  constraint deals_provider_reference_length check (char_length(provider_reference) between 2 and 255),
  constraint deals_external_url_format check (external_url ~ '^https://'),
  constraint deals_image_url_format check (image_url ~ '^https://'),
  constraint deals_price_positive check (price > 0),
  constraint deals_normal_price_valid check (normal_price >= price),
  constraint deals_currency_mxn check (currency = 'MXN'),
  constraint deals_savings_percentage_range check (savings_percentage between 0 and 100),
  constraint deals_departure_dates_valid check (departure_date_end >= departure_date_start),
  constraint deals_return_dates_valid check (
    (trip_type = 'ONE_WAY' and return_date_start is null and return_date_end is null and duration_days is null)
    or (
      trip_type = 'ROUND_TRIP'
      and return_date_start is not null
      and return_date_end is not null
      and return_date_end >= return_date_start
      and return_date_start > departure_date_start
      and duration_days is not null
      and duration_days > 0
    )
  ),
  constraint deals_duration_minutes_positive check (duration_minutes > 0),
  constraint deals_stops_range check (stops between 0 and 4),
  constraint deals_score_range check (score between 0 and 100),
  constraint deals_price_score_range check (price_score between 0 and 100),
  constraint deals_savings_score_range check (savings_score between 0 and 100),
  constraint deals_destination_score_range check (destination_score between 0 and 100),
  constraint deals_date_score_range check (date_score between 0 and 100),
  constraint deals_flight_quality_score_range check (flight_quality_score between 0 and 100),
  constraint deals_verification_state check (
    status not in ('APPROVED', 'PUBLISHED', 'EXPIRED') or verified_at is not null
  ),
  constraint deals_publication_state check (
    status not in ('PUBLISHED', 'EXPIRED') or published_at is not null
  ),
  constraint deals_expiration_state check (status <> 'EXPIRED' or expires_at is not null),
  constraint deals_rejection_state check (
    status <> 'REJECTED' or nullif(btrim(rejection_reason), '') is not null
  ),
  constraint deals_timeline_valid check (
    (verified_at is null or verified_at >= detected_at)
    and (published_at is null or published_at >= detected_at)
    and (expires_at is null or expires_at >= detected_at)
  ),
  constraint deals_fingerprint_length check (char_length(fingerprint) between 16 and 255),
  constraint deals_views_nonnegative check (views >= 0),
  constraint deals_affiliate_revenue_nonnegative check (affiliate_revenue >= 0),
  constraint deals_bookings_nonnegative check (bookings >= 0),
  unique (provider, provider_reference)
);

create index deals_public_feed_idx on public.deals (score desc, published_at desc)
  where status = 'PUBLISHED';
create index deals_origin_public_idx on public.deals (origin_airport_id, score desc, published_at desc)
  where status = 'PUBLISHED';
create index deals_destination_public_idx on public.deals (destination_airport_code, score desc, published_at desc)
  where status = 'PUBLISHED';
create index deals_type_public_idx on public.deals (deal_type, published_at desc)
  where status = 'PUBLISHED';
create index deals_status_detected_idx on public.deals (status, detected_at desc);
create index deals_departure_window_idx on public.deals (departure_date_start, departure_date_end);
create index deals_expires_idx on public.deals (expires_at) where status = 'PUBLISHED';

create table public.deal_views (
  id bigint generated always as identity primary key,
  deal_id uuid not null references public.deals(id) on delete cascade,
  session_id text not null,
  user_id uuid references public.users(id) on delete set null,
  source text,
  referrer text,
  viewed_at timestamptz not null default now(),
  constraint deal_views_session_id_length check (char_length(session_id) between 8 and 128),
  constraint deal_views_source_length check (source is null or char_length(source) <= 120),
  constraint deal_views_referrer_length check (referrer is null or char_length(referrer) <= 2000)
);

create index deal_views_deal_viewed_idx on public.deal_views (deal_id, viewed_at desc);
create index deal_views_session_viewed_idx on public.deal_views (session_id, viewed_at desc);

create table public.deal_clicks (
  id bigint generated always as identity primary key,
  deal_id uuid not null references public.deals(id) on delete cascade,
  session_id text not null,
  user_id uuid references public.users(id) on delete set null,
  referrer text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  clicked_at timestamptz not null default now(),
  converted boolean not null default false,
  affiliate_revenue numeric(12,2) not null default 0,
  booking_reference text,
  constraint deal_clicks_session_id_length check (char_length(session_id) between 8 and 128),
  constraint deal_clicks_referrer_length check (referrer is null or char_length(referrer) <= 2000),
  constraint deal_clicks_affiliate_revenue_nonnegative check (affiliate_revenue >= 0),
  constraint deal_clicks_conversion_valid check (not converted or booking_reference is not null)
);

create index deal_clicks_deal_clicked_idx on public.deal_clicks (deal_id, clicked_at desc);
create index deal_clicks_session_clicked_idx on public.deal_clicks (session_id, clicked_at desc);
create index deal_clicks_converted_idx on public.deal_clicks (clicked_at desc) where converted;

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  normalized_email text generated always as (lower(btrim(email))) stored,
  source text not null default 'website',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_email_format check (
    char_length(email) between 3 and 320
    and email = btrim(email)
    and email ~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$'
  ),
  constraint newsletter_source_allowed check (source in ('website', 'footer', 'modal', 'landing', 'admin', 'import')),
  unique (normalized_email)
);

create index newsletter_active_created_idx on public.newsletter_subscribers (created_at desc) where active;

create table public.provider_logs (
  id bigint generated always as identity primary key,
  provider text not null,
  run_id uuid not null default gen_random_uuid(),
  status text not null,
  records_found integer not null default 0,
  records_created integer not null default 0,
  records_updated integer not null default 0,
  duration_ms integer,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  constraint provider_logs_status_allowed check (status in ('STARTED', 'SUCCEEDED', 'FAILED', 'PARTIAL')),
  constraint provider_logs_counts_nonnegative check (
    records_found >= 0 and records_created >= 0 and records_updated >= 0
  ),
  constraint provider_logs_duration_nonnegative check (duration_ms is null or duration_ms >= 0),
  constraint provider_logs_finished_valid check (finished_at is null or finished_at >= started_at),
  constraint provider_logs_payload_object check (jsonb_typeof(payload) = 'object')
);

create index provider_logs_provider_created_idx on public.provider_logs (provider, created_at desc);
create index provider_logs_run_id_idx on public.provider_logs (run_id);
create index provider_logs_failed_idx on public.provider_logs (created_at desc) where status in ('FAILED', 'PARTIAL');

create table public.deal_history (
  id bigint generated always as identity primary key,
  deal_id uuid not null references public.deals(id) on delete cascade,
  from_status public.status,
  to_status public.status not null,
  changed_by uuid references public.users(id) on delete set null,
  reason text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint deal_history_status_changed check (from_status is null or from_status <> to_status),
  constraint deal_history_snapshot_object check (jsonb_typeof(snapshot) = 'object')
);

create index deal_history_deal_created_idx on public.deal_history (deal_id, created_at desc);
create index deal_history_status_created_idx on public.deal_history (to_status, created_at desc);

create table public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  home_airport_id uuid references public.airports(id) on delete set null,
  preferred_trip_type public.trip_type,
  preferred_deal_types public.deal_type[] not null default '{}'::public.deal_type[],
  preferred_destinations text[] not null default '{}'::text[],
  minimum_price numeric(12,2),
  maximum_price numeric(12,2),
  email_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_price_nonnegative check (
    coalesce(minimum_price, 0) >= 0 and coalesce(maximum_price, 0) >= 0
  ),
  constraint user_preferences_price_order check (
    minimum_price is null or maximum_price is null or minimum_price <= maximum_price
  )
);

create index user_preferences_deal_types_idx on public.user_preferences using gin (preferred_deal_types);
create index user_preferences_destinations_idx on public.user_preferences using gin (preferred_destinations);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    exists (
      select 1
      from public.users
      where id = auth.uid()
        and role = 'ADMIN'::public.user_role
    ),
    false
  );
$$;

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.users
    set email = new.email
    where id = new.id;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_deal_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'DISCOVERED' and new.status = 'REVIEW')
    or (old.status = 'REVIEW' and new.status in ('APPROVED', 'REJECTED'))
    or (old.status = 'APPROVED' and new.status in ('PUBLISHED', 'REJECTED'))
    or (old.status = 'PUBLISHED' and new.status = 'EXPIRED')
  ) then
    raise exception 'Invalid deal status transition from % to %', old.status, new.status;
  end if;

  if new.status = 'APPROVED' and new.verified_at is null then
    new.verified_at = now();
  end if;

  if new.status = 'PUBLISHED' and new.published_at is null then
    new.published_at = now();
  end if;

  if new.status = 'EXPIRED' and new.expires_at is null then
    new.expires_at = now();
  end if;

  return new;
end;
$$;

create or replace function public.record_deal_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.deal_history (
    deal_id,
    from_status,
    to_status,
    changed_by,
    reason,
    snapshot
  ) values (
    new.id,
    case when tg_op = 'INSERT' then null else old.status end,
    new.status,
    auth.uid(),
    case when new.status = 'REJECTED' then new.rejection_reason else null end,
    jsonb_build_object(
      'title', new.title,
      'price', new.price,
      'currency', new.currency,
      'score', new.score,
      'provider', new.provider,
      'updated_at', new.updated_at
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user();

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_auth_user_email();

create trigger users_90_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger airports_set_updated_at
  before update on public.airports
  for each row execute function public.set_updated_at();

create trigger destinations_set_updated_at
  before update on public.destinations
  for each row execute function public.set_updated_at();

create trigger deals_10_enforce_status_transition
  before update of status on public.deals
  for each row execute function public.enforce_deal_status_transition();

create trigger deals_90_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create trigger deals_record_history
  after insert or update of status on public.deals
  for each row execute function public.record_deal_history();

create trigger newsletter_subscribers_set_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.airports enable row level security;
alter table public.destinations enable row level security;
alter table public.deals enable row level security;
alter table public.deal_views enable row level security;
alter table public.deal_clicks enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.provider_logs enable row level security;
alter table public.deal_history enable row level security;
alter table public.user_preferences enable row level security;

create policy users_read_own
  on public.users for select
  to authenticated
  using (id = auth.uid());

create policy users_admin_manage
  on public.users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy airports_public_read
  on public.airports for select
  to anon, authenticated
  using (active);

create policy airports_admin_manage
  on public.airports for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy destinations_public_read
  on public.destinations for select
  to anon, authenticated
  using (active);

create policy destinations_admin_manage
  on public.destinations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy deals_public_read
  on public.deals for select
  to anon, authenticated
  using (
    status = 'PUBLISHED'
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

create policy deals_admin_manage
  on public.deals for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy deal_views_admin_read
  on public.deal_views for select
  to authenticated
  using (public.is_admin());

create policy deal_clicks_admin_read
  on public.deal_clicks for select
  to authenticated
  using (public.is_admin());

create policy newsletter_public_insert
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (
    email = btrim(email)
    and source in ('website', 'footer', 'modal', 'landing')
    and active
  );

create policy newsletter_admin_manage
  on public.newsletter_subscribers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy provider_logs_admin_manage
  on public.provider_logs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy deal_history_admin_read
  on public.deal_history for select
  to authenticated
  using (public.is_admin());

create policy user_preferences_own_access
  on public.user_preferences for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy user_preferences_admin_manage
  on public.user_preferences for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on table public.users from anon, authenticated;
revoke all on table public.airports from anon, authenticated;
revoke all on table public.destinations from anon, authenticated;
revoke all on table public.deals from anon, authenticated;
revoke all on table public.deal_views from anon, authenticated;
revoke all on table public.deal_clicks from anon, authenticated;
revoke all on table public.newsletter_subscribers from anon, authenticated;
revoke all on table public.provider_logs from anon, authenticated;
revoke all on table public.deal_history from anon, authenticated;
revoke all on table public.user_preferences from anon, authenticated;

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.handle_auth_user() from public;
revoke execute on function public.sync_auth_user_email() from public;
revoke execute on function public.enforce_deal_status_transition() from public;
revoke execute on function public.record_deal_history() from public;

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.airports, public.destinations, public.deals to anon;
grant insert (email, source) on table public.newsletter_subscribers to anon;
grant all on table public.users, public.airports, public.destinations, public.deals,
  public.newsletter_subscribers, public.provider_logs, public.user_preferences to authenticated;
grant select on table public.deal_views, public.deal_clicks, public.deal_history to authenticated;
grant all on table public.users, public.airports, public.destinations, public.deals,
  public.deal_views, public.deal_clicks, public.newsletter_subscribers,
  public.provider_logs, public.deal_history, public.user_preferences to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;
