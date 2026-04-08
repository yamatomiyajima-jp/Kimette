-- rooms テーブルに items_anonymous カラムを追加
-- 'off' = 匿名不可（デフォルト）, 'optional' = 匿名の選択可, 'on' = 全員匿名
alter table rooms add column items_anonymous text not null default 'off'
  check (items_anonymous in ('off', 'optional', 'on'));

-- items テーブルに is_anonymous カラムを追加（匿名選択可のときに使う）
alter table items add column is_anonymous boolean not null default false;
