create table if not exists of_post_log (
  id uuid default gen_random_uuid() primary key,
  slot text not null,
  posted_at timestamptz default now(),
  content text,
  status text default 'success',
  error text
);

-- Index for fast daily count queries
create index if not exists of_post_log_posted_at_idx on of_post_log (posted_at desc);

-- Index for slot filtering
create index if not exists of_post_log_slot_idx on of_post_log (slot);
