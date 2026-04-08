-- votes に匿名フラグを追加（optional モード用）
alter table votes add column is_anonymous boolean not null default false;

-- comments に匿名フラグを追加（optional モード用）
alter table comments add column is_anonymous boolean not null default false;
