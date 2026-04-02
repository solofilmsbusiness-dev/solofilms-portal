create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  source text, -- 'youtube', 'instagram', 'tiktok', 'direct', 'twitter'
  signed_up_at timestamptz default now(),
  notified_at timestamptz,
  status text default 'waiting' -- 'waiting', 'notified', 'enrolled'
);

create index waitlist_signed_up_at_idx on waitlist (signed_up_at desc);
create index waitlist_source_idx on waitlist (source);
create index waitlist_status_idx on waitlist (status);
