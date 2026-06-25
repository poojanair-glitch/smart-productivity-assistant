-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
drop policy if exists "Allow profile read for owner" on public.profiles;
drop policy if exists "Allow profile insert for owner" on public.profiles;
drop policy if exists "Allow profile update for owner" on public.profiles;
create policy "Allow profile read for owner" on public.profiles for select using (auth.uid() = id);
create policy "Allow profile insert for owner" on public.profiles for insert with check (auth.uid() = id);
create policy "Allow profile update for owner" on public.profiles for update with check (auth.uid() = id);

-- TASKS TABLE
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text default 'General',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  due_date date not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;
drop policy if exists "Allow tasks operations for owner" on public.tasks;
create policy "Allow tasks operations for owner" on public.tasks for all using (auth.uid() = user_id);

-- NOTES TABLE
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text not null,
  category text default 'General',
  ai_summary text,
  action_items jsonb default '[]'::jsonb,
  file_url text,
  file_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notes enable row level security;
drop policy if exists "Allow notes operations for owner" on public.notes;
create policy "Allow notes operations for owner" on public.notes for all using (auth.uid() = user_id);

-- REMINDERS TABLE
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  remind_at timestamp with time zone not null,
  status text check (status in ('active', 'snoozed', 'dismissed')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reminders enable row level security;
drop policy if exists "Allow reminders operations for owner" on public.reminders;
create policy "Allow reminders operations for owner" on public.reminders for all using (auth.uid() = user_id);

-- ANALYTICS TABLE
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  productivity_score integer default 0,
  completed_count integer default 0,
  pending_count integer default 0,
  recorded_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, recorded_date)
);

alter table public.analytics enable row level security;
drop policy if exists "Allow analytics operations for owner" on public.analytics;
create policy "Allow analytics operations for owner" on public.analytics for all using (auth.uid() = user_id);

-- WEEKLY SUMMARIES TABLE
create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  week_start_date date not null,
  summary_text text not null,
  productivity_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.weekly_summaries enable row level security;
drop policy if exists "Allow summaries operations for owner" on public.weekly_summaries;
create policy "Allow summaries operations for owner" on public.weekly_summaries for all using (auth.uid() = user_id);

-- Profile Sync Trigger (Creates profile when user registers)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
