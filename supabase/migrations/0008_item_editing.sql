-- 商品の他者編集設定と最終編集者カラムを追加
ALTER TABLE items ADD COLUMN editable_by_others boolean NOT NULL DEFAULT false;
ALTER TABLE items ADD COLUMN last_edited_by uuid REFERENCES participants(id) ON DELETE SET NULL;
