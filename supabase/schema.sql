-- Paste the whole file into the Supabase SQL Editor and hit Run.
-- Idempotent: re-running it is a no-op, not an error.

create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique,                       -- object path in the bucket
  caption     text,
  taken_on    date,
  uploaded_by uuid not null references auth.users default auth.uid(),
  created_at  timestamptz not null default now()
);

alter table photos enable row level security;

-- Two people who trust each other: everyone signed in sees everything,
-- but you can only delete your own uploads.
-- (Postgres has no CREATE POLICY IF NOT EXISTS, hence the drops.)
drop policy if exists "signed in can read" on photos;
create policy "signed in can read" on photos for select to authenticated using (true);

drop policy if exists "signed in can add" on photos;
create policy "signed in can add" on photos for insert to authenticated with check (auth.uid() = uploaded_by);

drop policy if exists "delete your own" on photos;
create policy "delete your own" on photos for delete to authenticated using (auth.uid() = uploaded_by);

-- Private bucket. Files are only ever reachable through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit)
values ('photos', 'photos', false, 15728640)
on conflict (id) do nothing;

drop policy if exists "signed in can view files" on storage.objects;
create policy "signed in can view files" on storage.objects for select to authenticated
  using (bucket_id = 'photos');

-- Uploads land in a per-user folder, which is what makes "delete your own" enforceable.
drop policy if exists "signed in can upload" on storage.objects;
create policy "signed in can upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "delete your own files" on storage.objects;
create policy "delete your own files" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
