import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/session";
import type { Room, Participant, Item, Vote, Comment } from "@/lib/types";
import { JoinForm } from "./join-form";
import { ItemsPhase } from "./items-phase";
import { VotePhase } from "./vote-phase";
import { ResultPhase } from "./result-phase";

// 常にリアルタイムデータを返す
export const dynamic = "force-dynamic";

interface RoomPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // ルーム情報を取得
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("url_slug", slug)
    .single();

  if (!room) {
    notFound();
  }

  const typedRoom = room as Room;

  // 参加者一覧・商品一覧・Cookie を並列取得
  const [participantsResult, itemsResult, participantId] = await Promise.all([
    supabase
      .from("participants")
      .select("*")
      .eq("room_id", typedRoom.id)
      .order("joined_at", { ascending: true }),
    supabase
      .from("items")
      .select("*")
      .eq("room_id", typedRoom.id)
      .order("created_at", { ascending: true }),
    getParticipantId(typedRoom.id),
  ]);

  const typedParticipants = (participantsResult.data ?? []) as Participant[];
  const typedItems = (itemsResult.data ?? []) as Item[];
  const creator = typedParticipants.find((p) => p.is_creator);
  const currentParticipant = typedParticipants.find(
    (p) => p.id === participantId
  );

  // 参加済みの場合はフェーズに応じた画面を表示
  if (currentParticipant) {
    if (typedRoom.phase === "registration") {
      return (
        <RoomLayout>
          <ItemsPhase
            room={typedRoom}
            items={typedItems}
            participants={typedParticipants}
            currentParticipant={currentParticipant}
          />
        </RoomLayout>
      );
    }

    // voting / closed: 投票とコメントも必要
    const itemIds = typedItems.map((i) => i.id);
    const [votesResult, commentsResult] = await Promise.all([
      supabase
        .from("votes")
        .select("*")
        .in("item_id", itemIds.length > 0 ? itemIds : [""]),
      supabase
        .from("comments")
        .select("*")
        .in("item_id", itemIds.length > 0 ? itemIds : [""]),
    ]);

    const votes = (votesResult.data ?? []) as Vote[];
    const comments = (commentsResult.data ?? []) as Comment[];

    if (typedRoom.phase === "voting") {
      return (
        <RoomLayout>
          <VotePhase
            room={typedRoom}
            items={typedItems}
            participants={typedParticipants}
            currentParticipant={currentParticipant}
            votes={votes}
            comments={comments}
          />
        </RoomLayout>
      );
    }

    // closed フェーズ
    return (
      <RoomLayout>
        <ResultPhase
          room={typedRoom}
          items={typedItems}
          participants={typedParticipants}
          currentParticipant={currentParticipant}
          votes={votes}
          comments={comments}
        />
      </RoomLayout>
    );
  }

  // 未参加かつ結果発表済み: 結果画面を表示
  if (typedRoom.phase === "closed") {
    const itemIds = typedItems.map((i) => i.id);
    const [votesResult, commentsResult] = await Promise.all([
      supabase
        .from("votes")
        .select("*")
        .in("item_id", itemIds.length > 0 ? itemIds : [""]),
      supabase
        .from("comments")
        .select("*")
        .in("item_id", itemIds.length > 0 ? itemIds : [""]),
    ]);

    return (
      <RoomLayout>
        <ResultPhase
          room={typedRoom}
          items={typedItems}
          participants={typedParticipants}
          currentParticipant={null}
          votes={(votesResult.data ?? []) as Vote[]}
          comments={(commentsResult.data ?? []) as Comment[]}
        />
      </RoomLayout>
    );
  }

  // 未参加: 参加フォーム表示
  return (
    <RoomLayout>
      <div className="text-center py-5">
        <div className="w-14 h-14 bg-bg-info rounded-full mx-auto mb-4 flex items-center justify-center text-text-info text-[28px]">
          🎁
        </div>
        <h1 className="text-[17px] font-medium text-text-primary">
          {typedRoom.name}
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          {creator?.nickname}さんが作成したルーム
        </p>
      </div>

      <ParticipantsList participants={typedParticipants} />

      <JoinForm roomId={typedRoom.id} slug={slug} />

      <p className="text-[11px] text-text-tertiary text-center mt-4">
        アカウント登録は不要です
      </p>
    </RoomLayout>
  );
}

function RoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 justify-center bg-bg-secondary">
      <div className="w-full max-w-sm bg-bg-primary min-h-dvh">
        <div className="px-[18px] py-[22px]">{children}</div>
      </div>
    </div>
  );
}

function ParticipantsList({
  participants,
}: {
  participants: Participant[];
}) {
  return (
    <div className="bg-bg-secondary rounded-md p-3 mb-5">
      <div className="text-xs text-text-secondary mb-1">
        参加中（{participants.length}人）
      </div>
      <div className="text-[13px]">
        {participants.map((p) => p.nickname).join("、")}
      </div>
    </div>
  );
}
