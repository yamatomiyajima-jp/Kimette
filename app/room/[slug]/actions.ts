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
    .select("id")
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
  const editableByOthers = formData.get("editableByOthers") === "on";

  if (!name) {
    throw new Error("商品名は必須です");
  }

  // cookie 取得と Supabase クライアント作成を並列化
  const [participantId, supabase] = await Promise.all([
    getParticipantId(roomId),
    createClient(),
  ]);

  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const { error } = await supabase.from("items").insert({
    room_id: roomId,
    added_by: participantId,
    name,
    description,
    product_url: productUrl,
    is_anonymous: isAnonymous,
    editable_by_others: editableByOthers,
  });

  if (error) {
    throw new Error("商品の追加に失敗しました");
  }

  // revalidatePath 不要: Realtime が検知して router.refresh() する
}

export async function updateItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const roomId = formData.get("roomId") as string;
  const description = (formData.get("description") as string)?.trim() || null;
  const productUrl = (formData.get("productUrl") as string)?.trim() || null;

  const [participantId, supabase] = await Promise.all([
    getParticipantId(roomId),
    createClient(),
  ]);

  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  // 対象商品を取得して権限チェック
  const { data: item } = await supabase
    .from("items")
    .select("added_by, editable_by_others")
    .eq("id", itemId)
    .single();

  if (!item) {
    throw new Error("商品が見つかりません");
  }

  const isOwner = item.added_by === participantId;
  if (!isOwner && !item.editable_by_others) {
    throw new Error("この商品を編集する権限がありません");
  }

  const { error } = await supabase
    .from("items")
    .update({ description, product_url: productUrl, last_edited_by: participantId })
    .eq("id", itemId);

  if (error) {
    throw new Error("商品の更新に失敗しました");
  }
}

export async function deleteItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const roomId = formData.get("roomId") as string;

  const [participantId, supabase] = await Promise.all([
    getParticipantId(roomId),
    createClient(),
  ]);

  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  // 権限確認と削除を1クエリで実行
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId)
    .eq("added_by", participantId);

  if (error) {
    throw new Error("商品の削除に失敗しました");
  }
}

export async function startVoting(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const slug = formData.get("slug") as string;

  const [participantId, supabase] = await Promise.all([
    getParticipantId(roomId),
    createClient(),
  ]);

  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

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

  // フェーズ遷移はページ遷移を伴うため revalidate が必要
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
  const [participantId, supabase] = await Promise.all([
    getParticipantId(roomId),
    createClient(),
  ]);

  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

  const now = new Date().toISOString();

  // チップを一括 UPSERT
  const voteRows = chipAllocations.map(({ itemId, chips }) => ({
    participant_id: participantId,
    item_id: itemId,
    chips,
    is_anonymous: voteAnonymous,
    updated_at: now,
  }));

  // コメントの UPSERT 用データを準備
  const upsertComments = commentEntries.filter((e) => e.body);
  const deleteComments = commentEntries.filter((e) => !e.body);

  // 投票保存とコメント操作を並列実行
  const tasks: (() => Promise<void>)[] = [];

  if (voteRows.length > 0) {
    tasks.push(async () => {
      const { error } = await supabase
        .from("votes")
        .upsert(voteRows, { onConflict: "participant_id,item_id" });
      if (error) throw new Error("投票の保存に失敗しました");
    });
  }

  if (upsertComments.length > 0) {
    const commentRows = upsertComments.map(({ itemId, body, isAnonymous }) => ({
      participant_id: participantId,
      item_id: itemId,
      body,
      is_anonymous: isAnonymous,
      updated_at: now,
    }));
    tasks.push(async () => {
      const { error } = await supabase
        .from("comments")
        .upsert(commentRows, { onConflict: "participant_id,item_id" });
      if (error) throw new Error("コメントの保存に失敗しました");
    });
  }

  for (const { itemId } of deleteComments) {
    tasks.push(async () => {
      await supabase
        .from("comments")
        .delete()
        .eq("participant_id", participantId)
        .eq("item_id", itemId);
    });
  }

  await Promise.all(tasks.map((fn) => fn()));
}

export async function closeRoom(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const slug = formData.get("slug") as string;

  const [participantId, supabase] = await Promise.all([
    getParticipantId(roomId),
    createClient(),
  ]);

  if (!participantId) {
    throw new Error("参加者情報が見つかりません");
  }

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

  // フェーズ遷移はページ遷移を伴うため revalidate が必要
  revalidatePath(`/room/${slug}`);
}
