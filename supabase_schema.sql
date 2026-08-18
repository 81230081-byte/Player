-- عاداتي 2.0 — Supabase schema
-- شغّل هذا بعد إنشاء مشروع Supabase. كل جدول محمي بـ RLS.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  timezone text not null default 'UTC',
  country text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category text,
  icon text,
  target numeric not null default 1,
  unit text not null default 'مرة',
  frequency jsonb not null default '{"type":"daily"}'::jsonb,
  active boolean not null default true,
  xp integer not null default 5,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  value numeric not null default 1,
  completed boolean not null default true,
  completed_at timestamptz,
  unique(user_id, habit_id, date)
);

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  prayer text not null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text not null default 'pending',
  unique(user_id, date, prayer)
);

create table if not exists public.athkar_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null,
  item_progress jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, date, type)
);

create table if not exists public.quran_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  page integer not null,
  pages_read integer not null default 0,
  unique(user_id, date)
);

create table if not exists public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  completion_rate numeric not null default 0,
  xp integer not null default 0,
  streak integer not null default 0,
  unique(user_id, date)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_key)
);

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.prayers enable row level security;
alter table public.athkar_sessions enable row level security;
alter table public.quran_progress enable row level security;
alter table public.daily_stats enable row level security;
alter table public.achievements enable row level security;

create policy "profiles own rows" on public.profiles for all to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "habits own rows" on public.habits for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "habit completions own rows" on public.habit_completions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "prayers own rows" on public.prayers for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "athkar own rows" on public.athkar_sessions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "quran own rows" on public.quran_progress for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "daily stats own rows" on public.daily_stats for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "achievements own rows" on public.achievements for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create index if not exists idx_habit_completions_user_date on public.habit_completions(user_id,date);
create index if not exists idx_prayers_user_date on public.prayers(user_id,date);
create index if not exists idx_daily_stats_user_date on public.daily_stats(user_id,date);
