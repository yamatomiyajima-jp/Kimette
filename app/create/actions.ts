"use server";

import { createClient } from "@/lib/supabase/server";
import { setParticipantId } from "@/lib/session";

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

/** ルームを作成し、URL slug を返す（リダイレクトはクライアント側で行う） */
export async function createRoom(formData: FormData): Promise<string> {
  const nickname = (formData.get("nickname") as string)?.trim();
  const roomName = (formData.get("roomName") as string)?.trim();
  const chipsPerPerson = Number(formData.get("chipsPerPerson")) || 10;
  const startMode = formData.get("startMode") as string;
  const voteVisibility = (formData.get("voteVisibility") as string) || "total_only";
  const votesAnonymous = (formData.get("votesAnonymous") as string) || "off";
  const commentsAnonymous = (formData.get("commentsAnonymous") as string) || "off";
  const itemsAnonymous = (formData.get("itemsAnonymous") as string) || "off";
  const votingStartsAt = formData.get("votingStartsAt") as string | null;
  const endMode = (formData.get("endMode") as string) || "manual";
  const votingEndsAt = formData.get("votingEndsAt") as string | null;

  if (!nickname || !roomName) {
    throw new Error("ニックネームとルーム名は必須です");
  }

  const urlSlug = generateSlug();
  const supabase = await createClient();

  // RPC でルーム作成＋参加者登録を1回のDB往復で実行
  const { data, error } = await supabase.rpc("create_room_with_creator", {
    p_room_name: roomName,
    p_url_slug: urlSlug,
    p_chips_per_person: chipsPerPerson,
    p_start_mode: startMode,
    p_vote_visibility: voteVisibility,
    p_votes_anonymous: votesAnonymous,
    p_comments_anonymous_mode: commentsAnonymous,
    p_items_anonymous: itemsAnonymous,
    p_nickname: nickname,
    p_voting_starts_at: votingStartsAt ? new Date(votingStartsAt).toISOString() : null,
    p_end_mode: endMode,
    p_voting_ends_at: votingEndsAt ? new Date(votingEndsAt).toISOString() : null,
  });

  if (error || !data) {
    throw new Error("ルームの作成に失敗しました");
  }

  const { room_id, participant_id } = data as { room_id: string; participant_id: string };

  // cookie保存（次のページ遷移に必要）
  await setParticipantId(room_id, participant_id);

  return urlSlug;
}
