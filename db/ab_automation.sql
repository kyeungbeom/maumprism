-- notifications 테이블에 variant 컬럼 추가
alter table notifications add column if not exists variant text default null;

-- users_notifications 테이블에 variant 컬럼 추가
alter table users_notifications add column if not exists variant text default null;

-- 2. gpt_logs 테이블 생성
create table if not exists gpt_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text,
  prompt text,
  created_at timestamp with time zone default now()
);

-- 3. feedback 테이블 생성
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message_id uuid,
  score int,
  comment text,
  created_at timestamp with time zone default now()
); 