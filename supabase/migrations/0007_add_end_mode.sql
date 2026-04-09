-- 投票終了タイミングの設定カラムを追加
ALTER TABLE rooms ADD COLUMN end_mode text NOT NULL DEFAULT 'manual'
  CHECK (end_mode IN ('manual', 'scheduled'));
ALTER TABLE rooms ADD COLUMN voting_ends_at timestamptz;
