-- ============================================
-- Kimette データベース初期マイグレーション
-- ============================================

-- UUID生成用の拡張
create extension if not exists "pgcrypto";

-- ============================================
-- テーブル作成
-- ============================================

-- rooms（ルーム）
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url_slug text not null unique,
  chips_per_person int not null default 10,
  phase text not null default 'registration'
    check (phase in ('registration', 'voting', 'closed')),
  start_mode text not null default 'manual'
    check (start_mode in ('manual', 'scheduled')),
  voting_starts_at timestamptz,
  show_others_votes boolean not null default true,
  show_vote_breakdown boolean not null default false,
  comments_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- participants（参加者）
create table participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  nickname text not null,
  is_creator boolean not null default false,
  joined_at timestamptz not null default now()
);

-- items（商品）
create table items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  added_by uuid not null references participants(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  product_url text,
  created_at timestamptz not null default now()
);

-- votes（投票）
create table votes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  chips int not null default 0 check (chips >= 0),
  updated_at timestamptz not null default now(),
  unique (participant_id, item_id)
);

-- comments（コメント）
create table comments (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, item_id)
);

-- ============================================
-- インデックス
-- ============================================

create index idx_participants_room_id on participants(room_id);
create index idx_items_room_id on items(room_id);
create index idx_votes_item_id on votes(item_id);
create index idx_comments_item_id on comments(item_id);

-- ============================================
-- Realtime 有効化
-- ============================================

alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table comments;

-- ============================================
-- Row Level Security
-- ============================================
-- データ操作は Server Actions 経由で行うため、
-- RLS は anon ユーザーに対して SELECT を許可し、
-- 書き込み制御はアプリケーション層で担保する。
-- 将来 Anonymous Auth を導入する際に厳格化する。

alter table rooms enable row level security;
alter table participants enable row level security;
alter table items enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;

-- 全テーブル: anon ユーザーによる読み取りを許可
create policy "rooms_select" on rooms for select using (true);
create policy "participants_select" on participants for select using (true);
create policy "items_select" on items for select using (true);
create policy "votes_select" on votes for select using (true);
create policy "comments_select" on comments for select using (true);

-- 全テーブル: anon ユーザーによる書き込みを許可
-- （書き込みの認可チェックは Server Actions 内で participant_id を検証して行う）
create policy "rooms_insert" on rooms for insert with check (true);
create policy "rooms_update" on rooms for update using (true);

create policy "participants_insert" on participants for insert with check (true);

create policy "items_insert" on items for insert with check (true);
create policy "items_update" on items for update using (true);
create policy "items_delete" on items for delete using (true);

create policy "votes_insert" on votes for insert with check (true);
create policy "votes_update" on votes for update using (true);

create policy "comments_insert" on comments for insert with check (true);
create policy "comments_update" on comments for update using (true);
create policy "comments_delete" on comments for delete using (true);
