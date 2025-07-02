create table if not exists emotion_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  emotion text not null,
  note text,
  created_at timestamp with time zone default now()
); 