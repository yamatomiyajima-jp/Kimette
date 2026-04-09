"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Room, Item, Participant, Vote, Comment } from "@/lib/types";
import { submitVote, closeRoom } from "./actions";
import { ParticipantsList } from "./participants-list";

interface VotePhaseProps {
  room: Room;
  items: Item[];
  participants: Participant[];
  currentParticipant: Participant;
  votes: Vote[];
  comments: Comment[];
}

export function VotePhase({
  room,
  items,
  participants,
  currentParticipant,
  votes: initialVotes,
  comments: initialComments,
}: VotePhaseProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [serverVotes, setServerVotes] = useState(initialVotes);
  const [serverComments, setServerComments] = useState(initialComments);

  const hasPreviousVotes = initialVotes.some(
    (v) => v.participant_id === currentParticipant.id && v.chips > 0
  );

  const [localChips, setLocalChips] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      const existing = initialVotes.find(
        (v) =>
          v.participant_id === currentParticipant.id && v.item_id === item.id
      );
      map[item.id] = existing?.chips ?? 0;
    }
    return map;
  });

  const [localComments, setLocalComments] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      for (const item of items) {
        const existing = initialComments.find(
          (c) =>
            c.participant_id === currentParticipant.id && c.item_id === item.id
        );
        map[item.id] = existing?.body ?? "";
      }
      return map;
    }
  );

  const [commentOpen, setCommentOpen] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const item of items) {
      const existing = initialComments.find(
        (c) =>
          c.participant_id === currentParticipant.id && c.item_id === item.id
      );
      if (existing?.body) set.add(item.id);
    }
    return set;
  });

  const [anonymousComment, setAnonymousComment] = useState<Set<string>>(new Set());
  const [anonymousVote, setAnonymousVote] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [voteDetailOpen, setVoteDetailOpen] = useState<Set<string>>(new Set());

  const usedChips = Object.values(localChips).reduce((sum, c) => sum + c, 0);
  const remainingChips = room.chips_per_person - usedChips;

  // Realtime 購読
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${room.id}:vote`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, router]);

  useEffect(() => {
    setServerVotes(initialVotes);
  }, [initialVotes]);

  useEffect(() => {
    setServerComments(initialComments);
  }, [initialComments]);

  const getParticipantName = useCallback(
    (participantId: string) => {
      if (participantId === currentParticipant.id) return "あなた";
      return (
        participants.find((p) => p.id === participantId)?.nickname ?? "不明"
      );
    },
    [participants, currentParticipant.id]
  );

  function handleChipChange(itemId: string, delta: number) {
    const current = localChips[itemId] ?? 0;
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && remainingChips <= 0) return;
    setLocalChips((prev) => ({ ...prev, [itemId]: next }));
    setIsConfirmed(false);
  }

  // チップ可視化をクリックして指定数に設定
  function handleChipClick(itemId: string, targetChips: number) {
    const current = localChips[itemId] ?? 0;
    const diff = targetChips - current;

    // 増やす場合: 残りチップが足りるか確認
    if (diff > 0 && diff > remainingChips) {
      // 足りない場合は残り全部を使う
      setLocalChips((prev) => ({ ...prev, [itemId]: current + remainingChips }));
    } else {
      setLocalChips((prev) => ({ ...prev, [itemId]: targetChips }));
    }
    setIsConfirmed(false);
  }

  function handleCommentChange(itemId: string, body: string) {
    setLocalComments((prev) => ({ ...prev, [itemId]: body }));
  }

  function handleConfirm() {
    const chipAllocations = items.map((item) => ({
      itemId: item.id,
      chips: localChips[item.id] ?? 0,
    }));

    const commentEntries = items
      .map((item) => ({
        itemId: item.id,
        body: (localComments[item.id] ?? "").trim(),
        isAnonymous: anonymousComment.has(item.id),
      }))
      .filter((e) => {
        const hadComment = initialComments.some(
          (c) =>
            c.participant_id === currentParticipant.id &&
            c.item_id === e.itemId
        );
        return e.body || hadComment;
      });

    startTransition(async () => {
      await submitVote(room.id, room.url_slug, chipAllocations, commentEntries, anonymousVote);
      setIsConfirmed(true);
    });
  }

  function handleReEdit() {
    setIsConfirmed(false);
  }

  function toggleExpand(itemId: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function toggleCommentOpen(itemId: string) {
    setCommentOpen((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function toggleVoteDetail(itemId: string) {
    setVoteDetailOpen((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function toggleAnonymousComment(itemId: string) {
    setAnonymousComment((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function getAllTotal(itemId: string) {
    const othersTotal = serverVotes
      .filter(
        (v) =>
          v.item_id === itemId && v.participant_id !== currentParticipant.id
      )
      .reduce((sum, v) => sum + v.chips, 0);
    return othersTotal + (localChips[itemId] ?? 0);
  }

  function getVoteBreakdown(itemId: string) {
    const others = serverVotes
      .filter(
        (v) =>
          v.item_id === itemId &&
          v.participant_id !== currentParticipant.id &&
          v.chips > 0
      )
      .map((v, i) => ({
        name:
          room.votes_anonymous === "on" || v.is_anonymous
            ? `匿名${i + 1}`
            : getParticipantName(v.participant_id),
        chips: v.chips,
      }));

    const myChips = localChips[itemId] ?? 0;
    if (myChips > 0) {
      others.push({ name: "あなた", chips: myChips });
    }
    return others.sort((a, b) => b.chips - a.chips);
  }

  function getOthersComments(itemId: string) {
    return serverComments.filter(
      (c) =>
        c.item_id === itemId && c.participant_id !== currentParticipant.id
    );
  }

  function getCommentAuthor(comment: Comment) {
    if (room.comments_anonymous_mode === "on") return "匿名";
    if (comment.is_anonymous) return "匿名";
    if (comment.participant_id === currentParticipant.id) return "あなた";
    return getParticipantName(comment.participant_id);
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-[17px] font-medium text-text-primary">
          持ち点を配分
        </h1>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[10px] bg-bg-success text-text-success">
          投票中
        </span>
      </div>

      {/* 参加者リスト */}
      <ParticipantsList
        participants={participants}
        isAnonymous={room.items_anonymous === "on"}
      />

      {/* 確定済みバナー */}
      {isConfirmed && (
        <div className="bg-bg-success rounded-md p-3 mt-3 text-center">
          <div className="text-text-success font-medium text-sm">
            ✓ 投票を確定しました
          </div>
          <button
            type="button"
            onClick={handleReEdit}
            className="mt-2 text-[11px] text-text-success underline"
          >
            投票を変更する
          </button>
        </div>
      )}

      {/* 持ちチップ表示 */}
      <div className="bg-bg-info rounded-md p-3.5 mt-3 mb-[18px]">
        <div className="flex justify-between items-baseline mb-2.5">
          <span className="text-xs text-text-info font-medium">
            あなたの持ちチップ
          </span>
          <span className="text-xs text-text-info">
            <strong className="text-lg font-medium">{remainingChips}</strong> /{" "}
            {room.chips_per_person}
          </span>
        </div>
        <div className="flex gap-[5px] flex-wrap justify-center min-h-6">
          {Array.from({ length: room.chips_per_person }, (_, i) => (
            <div
              key={i}
              className={`w-[18px] h-[18px] rounded-full border border-text-info ${
                i < remainingChips ? "bg-text-info" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 匿名投票チェックボックス（optional モード時） */}
      {room.votes_anonymous === "optional" && !isConfirmed && (
        <label className="flex items-center gap-2 text-[13px] text-text-secondary mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymousVote}
            onChange={() => setAnonymousVote((v) => !v)}
            className="w-4 h-4 rounded"
          />
          匿名で投票する
        </label>
      )}

      {/* 商品ごとの投票カード */}
      {items.map((item) => {
        const myChips = localChips[item.id] ?? 0;
        const allTotal = getAllTotal(item.id);
        const othersComments = getOthersComments(item.id);
        const isExpanded = expandedItems.has(item.id);
        const isCommentOpen = commentOpen.has(item.id);
        const isVoteDetailOpen = voteDetailOpen.has(item.id);

        return (
          <div
            key={item.id}
            className="p-3 border-[0.5px] border-black/15 rounded-md mb-3"
          >
            {/* 商品名 + チップ数 */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-medium">
                {item.product_url ? (
                  <a
                    href={item.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-info underline"
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </span>
              <span className="text-sm font-medium text-text-info">
                {myChips}個
              </span>
            </div>

            {/* チップ可視化（クリックで指定数に設定） */}
            <div className="flex gap-1 flex-wrap min-h-5 p-1.5 bg-bg-secondary rounded-md mb-2.5">
              {Array.from({ length: room.chips_per_person }, (_, i) => {
                const chipNumber = i + 1;
                const isFilled = i < myChips;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isConfirmed}
                    onClick={() => {
                      // 同じ位置をクリック → 0にリセット、それ以外 → その数に設定
                      if (chipNumber === myChips) {
                        handleChipClick(item.id, 0);
                      } else {
                        handleChipClick(item.id, chipNumber);
                      }
                    }}
                    className={`w-4 h-4 rounded-full border border-text-info transition-colors ${
                      isFilled ? "bg-text-info" : "bg-text-info opacity-15"
                    } ${isConfirmed ? "" : "cursor-pointer hover:opacity-80"}`}
                  />
                );
              })}
            </div>

            {/* +/- ボタン（確定後は非表示） */}
            {!isConfirmed && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChipChange(item.id, -1)}
                  disabled={myChips <= 0}
                  className="flex-1 py-2 text-[15px] bg-bg-primary border-[0.5px] border-black/30 rounded-md text-text-primary disabled:opacity-30"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => handleChipChange(item.id, 1)}
                  disabled={remainingChips <= 0}
                  className="flex-1 py-2 text-[15px] bg-bg-primary border-[0.5px] border-black/30 rounded-md text-text-primary disabled:opacity-30"
                >
                  +
                </button>
              </div>
            )}

            {/* 投票状況: 3モード対応 */}
            {room.vote_visibility !== "hidden" && allTotal > 0 && (
              <div className="mt-2">
                {room.vote_visibility === "detailed" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleVoteDetail(item.id)}
                      className="text-[11px] text-text-tertiary cursor-pointer"
                    >
                      合計 {allTotal} チップ {isVoteDetailOpen ? "▲" : "▼"}
                    </button>
                    {isVoteDetailOpen && (
                      <div className="mt-1 pl-2 border-l-2 border-black/10">
                        {getVoteBreakdown(item.id).map((v, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-[11px] text-text-secondary py-0.5"
                          >
                            <span>{v.name}</span>
                            <span>{v.chips}チップ</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[11px] text-text-tertiary">
                    合計 {allTotal} チップ
                  </div>
                )}
              </div>
            )}

            {/* 説明の展開/折りたたみ */}
            {item.description && (
              <>
                {isExpanded ? (
                  <div className="mt-2 p-2 bg-bg-secondary rounded-md">
                    <div className="text-[11px] text-text-tertiary mb-1">
                      説明
                    </div>
                    <div className="text-xs leading-relaxed">
                      {item.description}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="mt-1 text-[10px] text-text-tertiary border-[0.5px] border-black/30 rounded-md px-2 py-0.5"
                    >
                      閉じる
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="mt-2 text-[11px] text-text-info"
                  >
                    説明を見る
                  </button>
                )}
              </>
            )}

            {/* 他人のコメント表示 */}
            {othersComments.length > 0 && (
              <div className="mt-2 border-t-[0.5px] border-black/10 pt-2">
                <div className="text-[11px] text-text-tertiary mb-1">
                  コメント {othersComments.length}件
                </div>
                {othersComments.map((c) => (
                  <div key={c.id} className="mb-1.5">
                    <span className="text-[11px] font-medium">
                      {getCommentAuthor(c)}
                    </span>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* コメント入力（デフォルト閉じ、確定前のみ） */}
            {!isConfirmed && (
              <div className="mt-2">
                {isCommentOpen ? (
                  <div>
                    <textarea
                      value={localComments[item.id] ?? ""}
                      onChange={(e) =>
                        handleCommentChange(item.id, e.target.value)
                      }
                      rows={2}
                      placeholder="コメントを入力（任意）"
                      className="w-full px-2 py-1.5 text-xs border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary resize-none"
                    />
                    {room.comments_anonymous_mode === "optional" && (
                      <label className="flex items-center gap-1.5 mt-1 text-[11px] text-text-tertiary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={anonymousComment.has(item.id)}
                          onChange={() => toggleAnonymousComment(item.id)}
                          className="w-3.5 h-3.5 rounded"
                        />
                        匿名でコメント
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleCommentOpen(item.id)}
                      className="mt-1 text-[10px] text-text-tertiary"
                    >
                      閉じる
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleCommentOpen(item.id)}
                    className="text-[11px] text-text-info"
                  >
                    コメントを書く
                  </button>
                )}
              </div>
            )}

            {/* 確定後の自分のコメント表示 */}
            {isConfirmed && localComments[item.id] && (
              <div className="mt-2 border-t-[0.5px] border-black/10 pt-2">
                <div className="mb-1.5">
                  <span className="text-[11px] font-medium">あなた</span>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    {localComments[item.id]}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 投票を確定ボタン */}
      {!isConfirmed && (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending || usedChips === 0}
          className="w-full py-[13px] bg-text-primary text-white text-sm font-medium rounded-md disabled:opacity-40 mt-2"
        >
          {isPending
            ? "送信中..."
            : hasPreviousVotes
              ? "投票を更新する"
              : "投票を確定"}
        </button>
      )}

      {!isConfirmed && (
        <p className="text-[11px] text-text-tertiary text-center mt-2.5">
          チップを配分してから確定してください
        </p>
      )}

      {/* 結果発表ボタン（作成者のみ、確定後に表示） */}
      {currentParticipant.is_creator && isConfirmed && (
        <CloseRoomButton roomId={room.id} slug={room.url_slug} />
      )}

      {isConfirmed && (
        <p className="text-[11px] text-text-tertiary text-center mt-2.5">
          投票期間中はいつでも変更できます
        </p>
      )}
    </div>
  );
}

function CloseRoomButton({ roomId, slug }: { roomId: string; slug: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await closeRoom(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-[13px] bg-text-primary text-white text-sm font-medium rounded-md disabled:opacity-50"
      >
        {isSubmitting ? "集計しています..." : "結果を発表 →"}
      </button>
    </form>
  );
}

