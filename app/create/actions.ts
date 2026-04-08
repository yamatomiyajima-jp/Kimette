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
  const showOthersVotes = formData.get("showOthersVotes") === "on";
  const showVoteBreakdown = formData.get("showVoteBreakdown") === "on";
  const commentsAnonymous = formData.get("commentsAnonymous") === "on";

  if (!nickname || !roomName) {
    throw new Error("ニックネームとルーム名は必須です");
  }

  const supabase = await createClient();
  const urlSlug = generateSlug();

  // ルーム作成
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      name: roomName,
      url_slug: urlSlug,
      chips_per_person: chipsPerPerson,
      start_mode: startMode,
      show_others_votes: showOthersVotes,
      show_vote_breakdown: showVoteBreakdown,
      comments_anonymous: commentsAnonymous,
    })
    .select()
    .single();

  if (roomError || !room) {
    throw new Error("ルームの作成に失敗しました");
  }

  // 作成者を参加者として登録
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      nickname,
      is_creator: true,
    })
    .select()
    .single();

  if (participantError || !participant) {
    throw new Error("参加者の登録に失敗しました");
  }

  // 参加者IDを cookie に保存
  await setParticipantId(room.id, participant.id);

  return urlSlug;
}
