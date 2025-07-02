# 자동화 확장 DB 스키마 생성 가이드

아래 SQL을 Supabase SQL Editor 또는 psql 등에서 실행하세요.

```sql
-- notifications 테이블에 variant 컬럼 추가
alter table notifications add column if not exists variant text default null;

-- users_notifications 테이블에 variant 컬럼 추가
alter table users_notifications add column if not exists variant text default null;

-- gpt_logs 테이블 생성
create table if not exists gpt_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text,
  prompt text,
  created_at timestamp with time zone default now()
);

-- feedback 테이블 생성
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message_id uuid,
  score int,
  comment text,
  created_at timestamp with time zone default now()
);
```

- Supabase SQL Editor에서 위 스크립트를 실행하면 자동화 확장에 필요한 모든 테이블/필드가 생성됩니다.
- 기존 데이터에는 영향이 없습니다.
