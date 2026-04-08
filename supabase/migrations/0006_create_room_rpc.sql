-- ルーム作成と参加者登録を1回のDB呼び出しで行うRPC
-- ネットワーク往復を2回→1回に削減
CREATE OR REPLACE FUNCTION create_room_with_creator(
  p_room_name text,
  p_url_slug text,
  p_chips_per_person int,
  p_start_mode text,
  p_vote_visibility text,
  p_votes_anonymous text,
  p_comments_anonymous_mode text,
  p_items_anonymous text,
  p_nickname text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id uuid;
  v_participant_id uuid;
BEGIN
  -- ルーム作成
  INSERT INTO rooms (
    name, url_slug, chips_per_person, start_mode,
    vote_visibility, votes_anonymous, comments_anonymous_mode, items_anonymous
  ) VALUES (
    p_room_name, p_url_slug, p_chips_per_person, p_start_mode,
    p_vote_visibility, p_votes_anonymous, p_comments_anonymous_mode, p_items_anonymous
  )
  RETURNING id INTO v_room_id;

  -- 作成者を参加者として登録
  INSERT INTO participants (room_id, nickname, is_creator)
  VALUES (v_room_id, p_nickname, true)
  RETURNING id INTO v_participant_id;

  RETURN json_build_object(
    'room_id', v_room_id,
    'participant_id', v_participant_id
  );
END;
$$;
