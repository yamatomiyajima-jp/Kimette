"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setParticipantId, getParticipantId } from "@/lib/session";

export async function joinRoom(formData: FormData) {
  const nickname = (formData.get("nickname") as string)?.trim();
  const roomId = formData.get("roomId") as string;

  if (!nickname) {
    throw new Error("ニックネームは必須です");
  }

  const supabase = await createClient();

  const { data: participant, error } = await supabase
    .from("participants")
    .insert({
      room_id: roomId,
      nickname,
      is_creator: false,
    })
    .select()
    .single();

  if (error || !participant) {
    throw new Error("参加に失敗しました");
  }

  await setParticipantId(roomId, participant.id);
}

export async function addItem(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const productUrl = (formData.get("productUrl") as string)?.trim() || null;
  const isAnonymous = formData.get("isAnonymous") === "on";
  const slug = formData.get("slug") as string;

  if (!name) {
    throw new Error("商品名は必須です");
  }

  const participantId = await getParticipantId(roomId);
  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("items").insert({
    room_id: roomId,
    added_by: participantId,
    name,
    description,
    product_url: productUrl,
    is_anonymous: isAnonymous,
  });

  if (error) {
    throw new Error("商品の追加に失敗しました");
  }

  revalidatePath(`/room/${slug}`);
}

export async function updateItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const roomId = formData.get("roomId") as string;
  const description = (formData.get("description") as string)?.trim() || null;
  const slug = formData.get("slug") as string;

  const participantId = await getParticipantId(roomId);
  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const supabase = await createClient();

  // 自分が追加した商品か確認
  const { data: item } = await supabase
    .from("items")
    .select("added_by")
    .eq("id", itemId)
    .single();

  if (!item || item.added_by !== participantId) {
    throw new Error("この商品を編集する権限がありません");
  }

  const { error } = await supabase
    .from("items")
    .update({ description })
    .eq("id", itemId);

  if (error) {
    throw new Error("商品の更新に失敗しました");
  }

  revalidatePath(`/room/${slug}`);
}

export async function deleteItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const roomId = formData.get("roomId") as string;
  const slug = formData.get("slug") as string;

  const participantId = await getParticipantId(roomId);
  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const supabase = await createClient();

  // 自分が追加した商品か確認
  const { data: item } = await supabase
    .from("items")
    .select("added_by")
    .eq("id", itemId)
    .single();

  if (!item || item.added_by !== participantId) {
    throw new Error("この商品を削除する権限がありません");
  }

  const { error } = await supabase.from("items").delete().eq("id", itemId);

  if (error) {
    throw new Error("商品の削除に失敗しました");
  }

  revalidatePath(`/room/${slug}`);
}

export async function startVoting(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const slug = formData.get("slug") as string;

  const participantId = await getParticipantId(roomId);
  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const supabase = await createClient();

  // 作成者か確認
  const { data: participant } = await supabase
    .from("participants")
    .select("is_creator")
    .eq("id", participantId)
    .single();

  if (!participant?.is_creator) {
    throw new Error("投票を開始できるのは作成者のみです");
  }

  const { error } = await supabase
    .from("rooms")
    .update({ phase: "voting" })
    .eq("id", roomId);

  if (error) {
    throw new Error("投票の開始に失敗しました");
  }

  revalidatePath(`/room/${slug}`);
}

/** チップ配分とコメントを一括保存 */
export async function submitVote(
  roomId: string,
  slug: string,
  chipAllocations: { itemId: string; chips: number }[],
  commentEntries: { itemId: string; body: string; isAnonymous: boolean }[],
  voteAnonymous: boolean
) {
  const participantId = await getParticipantId(roomId);
  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  // チップを一括 UPSERT
  const voteRows = chipAllocations.map(({ itemId, chips }) => ({
    participant_id: participantId,
    item_id: itemId,
    chips,
    is_anonymous: voteAnonymous,
    updated_at: now,
  }));

  if (voteRows.length > 0) {
    const { error: voteError } = await supabase
      .from("votes")
      .upsert(voteRows, { onConflict: "participant_id,item_id" });

    if (voteError) {
      throw new Error("投票の保存に失敗しました");
    }
  }

  // コメントを一括 UPSERT / DELETE
  for (const { itemId, body, isAnonymous } of commentEntries) {
    if (!body) {
      await supabase
        .from("comments")
        .delete()
        .eq("participant_id", participantId)
        .eq("item_id", itemId);
    } else {
      await supabase
        .from("comments")
        .upsert(
          {
            participant_id: participantId,
            item_id: itemId,
            body,
            is_anonymous: isAnonymous,
            updated_at: now,
          },
          { onConflict: "participant_id,item_id" }
        );
    }
  }

  revalidatePath(`/room/${slug}`);
}

export async function closeRoom(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const slug = formData.get("slug") as string;

  const participantId = await getParticipantId(roomId);
  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const supabase = await createClient();

  const { data: participant } = await supabase
    .from("participants")
    .select("is_creator")
    .eq("id", participantId)
    .single();

  if (!participant?.is_creator) {
    throw new Error("結果を公開できるのは作成者のみです");
  }

  const { error } = await supabase
    .from("rooms")
    .update({ phase: "closed" })
    .eq("id", roomId);

  if (error) {
    throw new Error("結果の公開に失敗しました");
  }

  revalidatePath(`/room/${slug}`);
}
