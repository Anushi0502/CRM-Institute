create extension if not exists pgcrypto;

create table if not exists public.crm_overview_metrics (
  id text primary key,
  label text not null,
  value text not null,
  change text not null,
  detail text not null,
  tone text not null check (tone in ('teal', 'coral', 'amber', 'plum')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_leads (
  id text primary key,
  family_name text not null,
  child_name text not null,
  program_interest text not null,
  stage text not null check (stage in ('Inquiry', 'Tour Booked', 'Application Started', 'Waitlist', 'Enrolled')),
  source text not null,
  follow_up_date date not null,
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  campus text not null,
  age_group text not null,
  next_step text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_students (
  id text primary key,
  name text not null,
  guardian text not null,
  program text not null,
  attendance text not null,
  pickup_window text not null,
  support_focus text not null,
  tuition_status text not null check (tuition_status in ('Current', 'Review')),
  milestone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_backend_users (
  id uuid primary key,
  email text,
  created_at timestamptz not null default now(),
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  is_anonymous boolean,
  banned_until timestamptz,
  allow_sign_in boolean not null default true,
  app_role text not null default 'parent',
  updated_at timestamptz not null default now()
);

alter table public.crm_backend_users
  add column if not exists app_role text not null default 'parent';

alter table public.crm_backend_users
  drop constraint if exists crm_backend_users_app_role_check;

alter table public.crm_backend_users
  add constraint crm_backend_users_app_role_check
  check (app_role in ('parent', 'admin'));

create table if not exists public.crm_parent_portal_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  portal_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint crm_parent_portal_state_children_limit check (
    jsonb_typeof(coalesce(portal_state -> 'children', '[]'::jsonb)) = 'array'
    and jsonb_array_length(coalesce(portal_state -> 'children', '[]'::jsonb)) <= 20
  )
);

create table if not exists public.crm_programs (
  id text primary key,
  name text not null,
  age_range text not null,
  capacity text not null,
  fill_rate integer not null,
  leads integer not null,
  waitlist integer not null,
  educator_names text[] not null default '{}',
  description text not null,
  created_at timestamptz not null default now()
);

create or replace function public.sync_backend_user_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.crm_backend_users (
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at,
    is_anonymous,
    banned_until,
    allow_sign_in,
    app_role,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.created_at, now()),
    new.last_sign_in_at,
    new.email_confirmed_at,
    new.is_anonymous,
    new.banned_until,
    new.banned_until is null,
    'parent',
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    last_sign_in_at = excluded.last_sign_in_at,
    email_confirmed_at = excluded.email_confirmed_at,
    is_anonymous = excluded.is_anonymous,
    banned_until = excluded.banned_until,
    allow_sign_in = excluded.allow_sign_in,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_synced_to_backend on auth.users;

create trigger on_auth_user_synced_to_backend
after insert or update on auth.users
for each row execute function public.sync_backend_user_from_auth();

create table if not exists public.crm_tasks (
  id text primary key,
  title text not null,
  owner text not null,
  due_date date not null,
  status text not null check (status in ('Today', 'This Week', 'Done')),
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_activity (
  id text primary key,
  title text not null,
  description text not null,
  time text not null,
  tag text not null,
  tone text not null check (tone in ('teal', 'coral', 'amber', 'plum')),
  created_at timestamptz not null default now()
);

alter table public.crm_overview_metrics enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_students enable row level security;
alter table public.crm_backend_users enable row level security;
alter table public.crm_parent_portal_state enable row level security;
alter table public.crm_programs enable row level security;
alter table public.crm_tasks enable row level security;
alter table public.crm_activity enable row level security;

drop policy if exists "Authenticated users can read metrics" on public.crm_overview_metrics;
drop policy if exists "Authenticated users can read leads" on public.crm_leads;
drop policy if exists "Authenticated users can read students" on public.crm_students;
drop policy if exists "Users can read own backend profile" on public.crm_backend_users;
drop policy if exists "Users can read own parent portal state" on public.crm_parent_portal_state;
drop policy if exists "Users can insert own parent portal state" on public.crm_parent_portal_state;
drop policy if exists "Users can update own parent portal state" on public.crm_parent_portal_state;
drop policy if exists "Authenticated users can read programs" on public.crm_programs;
drop policy if exists "Authenticated users can read tasks" on public.crm_tasks;
drop policy if exists "Authenticated users can read activity" on public.crm_activity;

create policy "Authenticated users can read metrics"
  on public.crm_overview_metrics for select
  to authenticated
  using (true);

create policy "Authenticated users can read leads"
  on public.crm_leads for select
  to authenticated
  using (true);

create policy "Authenticated users can read students"
  on public.crm_students for select
  to authenticated
  using (true);

create policy "Users can read own backend profile"
  on public.crm_backend_users for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can read own parent portal state"
  on public.crm_parent_portal_state for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own parent portal state"
  on public.crm_parent_portal_state for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own parent portal state"
  on public.crm_parent_portal_state for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authenticated users can read programs"
  on public.crm_programs for select
  to authenticated
  using (true);

create policy "Authenticated users can read tasks"
  on public.crm_tasks for select
  to authenticated
  using (true);

create policy "Authenticated users can read activity"
  on public.crm_activity for select
  to authenticated
  using (true);

insert into public.crm_backend_users (
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at,
  is_anonymous,
  banned_until,
  allow_sign_in,
  app_role,
  updated_at
)
select
  users.id,
  users.email,
  coalesce(users.created_at, now()),
  users.last_sign_in_at,
  users.email_confirmed_at,
  users.is_anonymous,
  users.banned_until,
  users.banned_until is null,
  'parent',
  now()
from auth.users as users
on conflict (id) do update set
  email = excluded.email,
  last_sign_in_at = excluded.last_sign_in_at,
  email_confirmed_at = excluded.email_confirmed_at,
  is_anonymous = excluded.is_anonymous,
  banned_until = excluded.banned_until,
  allow_sign_in = excluded.allow_sign_in,
  updated_at = now();

insert into public.crm_overview_metrics (id, label, value, change, detail, tone, sort_order)
values
  ('families', 'Families in nurture flow', '128', '+14 this month', 'Tour interest is strongest for preschool and pre-k.', 'teal', 1),
  ('enrollment', 'Enrollment conversion', '62%', '+8 pts since Feb', 'Tour-to-application follow-up is improving within 48 hours.', 'coral', 2),
  ('attendance', 'Average attendance', '93%', '+3 pts this week', 'Toddler and pre-k rooms are trending above target.', 'amber', 3),
  ('retention', 'Family retention outlook', '96%', '4 renewals pending', 'Spring re-enrollment calls are scheduled for the next 7 days.', 'plum', 4)
on conflict (id) do update set
  label = excluded.label,
  value = excluded.value,
  change = excluded.change,
  detail = excluded.detail,
  tone = excluded.tone,
  sort_order = excluded.sort_order;

insert into public.crm_leads (id, family_name, child_name, program_interest, stage, source, follow_up_date, priority, campus, age_group, next_step)
values
  ('lead-alvarez', 'Alvarez', 'Mila', 'Preschool Discovery', 'Tour Booked', 'Website inquiry', '2026-03-15', 'High', 'Edina', '3 years', 'Confirm tour packet and allergy form.'),
  ('lead-thompson', 'Thompson', 'Noah', 'Infant Nurture Studio', 'Inquiry', 'Referral partner', '2026-03-14', 'High', 'Edina', '8 months', 'Call back with tuition guide and schedule options.'),
  ('lead-chen', 'Chen', 'Ivy', 'Pre-K Readiness', 'Application Started', 'Instagram ad', '2026-03-16', 'Medium', 'Edina', '4 years', 'Review vaccination records and finalize start week.'),
  ('lead-okafor', 'Okafor', 'Ethan', 'Toddler Explorers', 'Waitlist', 'Open house', '2026-03-18', 'Medium', 'Edina', '2 years', 'Offer next available slot and payment plan options.'),
  ('lead-patel', 'Patel', 'Aanya', 'Pre-K Readiness', 'Enrolled', 'Website inquiry', '2026-03-13', 'Low', 'Edina', '5 years', 'Send welcome pack and family onboarding checklist.'),
  ('lead-johnson', 'Johnson', 'Leo', 'Toddler Explorers', 'Tour Booked', 'Google search', '2026-03-17', 'Medium', 'Edina', '18 months', 'Prepare speech support resources for family questions.')
on conflict (id) do update set
  family_name = excluded.family_name,
  child_name = excluded.child_name,
  program_interest = excluded.program_interest,
  stage = excluded.stage,
  source = excluded.source,
  follow_up_date = excluded.follow_up_date,
  priority = excluded.priority,
  campus = excluded.campus,
  age_group = excluded.age_group,
  next_step = excluded.next_step;

insert into public.crm_students (id, name, guardian, program, attendance, pickup_window, support_focus, tuition_status, milestone)
values
  ('student-walker', 'Harper Walker', 'Sofia Walker', 'Preschool Discovery', '98%', '5:15 PM', 'Social confidence in group play', 'Current', 'Leading circle-time storytelling.'),
  ('student-khan', 'Aarav Khan', 'Nadia Khan', 'Pre-K Readiness', '94%', '4:45 PM', 'Early literacy reinforcement', 'Review', 'Recognizes all uppercase letters.'),
  ('student-garcia', 'Luna Garcia', 'Miguel Garcia', 'Toddler Explorers', '91%', '5:30 PM', 'Nap transition consistency', 'Current', 'Transitioning independently between centers.'),
  ('student-brown', 'Ezra Brown', 'Maya Brown', 'Infant Nurture Studio', '96%', '4:20 PM', 'Feeding rhythm tracking', 'Current', 'New sensory exploration plan started this week.')
on conflict (id) do update set
  name = excluded.name,
  guardian = excluded.guardian,
  program = excluded.program,
  attendance = excluded.attendance,
  pickup_window = excluded.pickup_window,
  support_focus = excluded.support_focus,
  tuition_status = excluded.tuition_status,
  milestone = excluded.milestone;

insert into public.crm_programs (id, name, age_range, capacity, fill_rate, leads, waitlist, educator_names, description)
values
  ('program-infant', 'Infant Nurture Studio', '6 weeks to 14 months', '16 seats', 88, 9, 3, array['Mina P.', 'Jordan K.'], 'Warm care, parent touchpoints, and developmental note tracking for the youngest families.'),
  ('program-toddler', 'Toddler Explorers', '15 months to 2.5 years', '20 seats', 95, 11, 6, array['Sasha L.', 'Daniel A.'], 'Movement-rich classrooms with transition routines, sensory play, and language-building moments.'),
  ('program-preschool', 'Preschool Discovery', '3 to 4 years', '24 seats', 82, 14, 2, array['Camila R.', 'Nina W.'], 'Project-based learning with family updates, milestone snapshots, and tour-ready classroom storytelling.'),
  ('program-prek', 'Pre-K Readiness', '4 to 5 years', '18 seats', 90, 10, 4, array['Grace F.', 'Anthony B.'], 'Kindergarten preparation with literacy, math confidence, and parent-facing progress reporting.')
on conflict (id) do update set
  name = excluded.name,
  age_range = excluded.age_range,
  capacity = excluded.capacity,
  fill_rate = excluded.fill_rate,
  leads = excluded.leads,
  waitlist = excluded.waitlist,
  educator_names = excluded.educator_names,
  description = excluded.description;

insert into public.crm_tasks (id, title, owner, due_date, status, priority, category)
values
  ('task-tour-packets', 'Send tour packets to the next three high-intent families.', 'Admissions', '2026-03-13', 'Today', 'High', 'Enrollment'),
  ('task-reenrollment', 'Call renewal families whose contracts expire in April.', 'Director', '2026-03-14', 'This Week', 'Medium', 'Retention'),
  ('task-attendance', 'Review attendance trend dips for toddler room after lunch.', 'Operations', '2026-03-15', 'This Week', 'Medium', 'Operations'),
  ('task-family-care', 'Follow up with the Khan family on literacy support resources.', 'Family Care', '2026-03-13', 'Today', 'High', 'Family Care')
on conflict (id) do update set
  title = excluded.title,
  owner = excluded.owner,
  due_date = excluded.due_date,
  status = excluded.status,
  priority = excluded.priority,
  category = excluded.category;

insert into public.crm_activity (id, title, description, time, tag, tone)
values
  ('activity-1', 'Family tour booked', 'The Alvarez family confirmed a Friday morning tour for Mila.', '10 minutes ago', 'Admissions', 'teal'),
  ('activity-2', 'Progress note shared', 'Harper Walker''s classroom note was delivered to her guardian.', '45 minutes ago', 'Student Success', 'amber'),
  ('activity-3', 'Waitlist seat opened', 'A toddler seat opens next month. Ethan Okafor is next in line.', '2 hours ago', 'Capacity', 'coral'),
  ('activity-4', 'Renewal conversation complete', 'The Walker family confirmed summer continuation and fall renewal.', 'Today', 'Retention', 'plum')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  time = excluded.time,
  tag = excluded.tag,
  tone = excluded.tone;
