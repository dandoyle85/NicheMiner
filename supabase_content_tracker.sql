-- Run this in Supabase SQL
create table if not exists content_tracker (
  id bigint generated always as identity primary key,
  niche text not null,
  keyword text not null,
  status text default 'idea',
  url text,
  date_saved timestamptz default now()
);
