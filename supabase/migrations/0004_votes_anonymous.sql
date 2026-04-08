-- 投票の匿名設定: 'off' = 名前表示, 'optional' = 匿名選択可, 'on' = 全員匿名
alter table rooms add column votes_anonymous text not null default 'off'
  check (votes_anonymous in ('off', 'optional', 'on'));
