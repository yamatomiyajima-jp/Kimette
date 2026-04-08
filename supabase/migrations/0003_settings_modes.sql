-- comments_anonymous: boolean → text 3モード化
alter table rooms add column comments_anonymous_mode text not null default 'off'
  check (comments_anonymous_mode in ('off', 'optional', 'on'));

-- 投票可視性: 'hidden' / 'total_only' / 'detailed'
alter table rooms add column vote_visibility text not null default 'total_only'
  check (vote_visibility in ('hidden', 'total_only', 'detailed'));

-- 旧カラムを削除（show_others_votes, show_vote_breakdown, comments_anonymous）
alter table rooms drop column if exists show_others_votes;
alter table rooms drop column if exists show_vote_breakdown;
alter table rooms drop column if exists comments_anonymous;
