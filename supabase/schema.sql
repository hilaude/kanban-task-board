create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date date,
  priority text not null check (priority in ('high', 'medium', 'low')),
  category text not null default '',
  tags text[] not null default '{}',
  status text not null check (status in ('todo', 'doing', 'waiting', 'done', 'hold')),
  color text not null default 'white' check (color in ('white', 'green', 'yellow', 'red', 'gray')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks
add column if not exists color text not null default 'white';

alter table public.tasks
drop constraint if exists tasks_color_check;

alter table public.tasks
add constraint tasks_color_check
check (color in ('white', 'green', 'yellow', 'red', 'gray'));

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_user_archived_idx on public.tasks (user_id, archived);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks for select
using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks for insert
with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks for delete
using (auth.uid() = user_id);
