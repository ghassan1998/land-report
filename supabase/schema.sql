-- =====================================================================
-- شغّل هذا الملف كاملاً مرة واحدة في Supabase → SQL Editor
-- =====================================================================

-- 1) المستخدمون (profiles) مرتبطون بحسابات Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'employee' check (role in ('employee','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 2) التقارير
create sequence if not exists public.report_seq;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_no text unique not null default
    ('LR-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.report_seq')::text, 3, '0')),
  status text not null default 'draft' check (status in ('draft','completed')),
  employee_id uuid not null default auth.uid() references public.profiles(id),
  employee_name text not null default '',
  client_name text not null default '',
  issue_date date not null default current_date,
  overall_status text not null default 'مناسب مبدئياً',
  overall_note text not null default '',
  data jsonb not null default '{}'::jsonb,
  export_count int not null default 0,
  last_exported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists reports_employee_idx on public.reports(employee_id);
create index if not exists reports_issue_idx on public.reports(issue_date);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists reports_touch on public.reports;
create trigger reports_touch before update on public.reports
  for each row execute function public.touch_updated_at();

-- عدّاد التصدير (يستدعيه التطبيق عند فتح صفحة الطباعة)
create or replace function public.log_export(rid uuid) returns void
language sql as $$
  update public.reports set export_count = export_count + 1, last_exported_at = now() where id = rid;
$$;

-- 3) الصلاحيات (RLS)
alter table public.profiles enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "reports all" on public.reports;
create policy "reports all" on public.reports for all
  using (employee_id = auth.uid() or public.is_admin())
  with check (employee_id = auth.uid() or public.is_admin());

-- 4) تخزين الصور (مجلد عام بمسارات عشوائية)
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true) on conflict (id) do nothing;

drop policy if exists "img insert" on storage.objects;
create policy "img insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-images');
drop policy if exists "img delete" on storage.objects;
create policy "img delete" on storage.objects for delete to authenticated
  using (bucket_id = 'report-images');

-- 5) بعد إنشاء أول حساب لك من Authentication → Users، اجعله مديراً:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR@EMAIL.com');
