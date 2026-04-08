import type { Room, Item, Participant, Vote, Comment } from "@/lib/types";

interface ResultPhaseProps {
  room: Room;
  items: Item[];
  participants: Participant[];
  currentParticipant: Participant | null;
  votes: Vote[];
  comments: Comment[];
}

interface RankedItem {
  item: Item;
  totalChips: number;
  rank: number;
  itemComments: Comment[];
  voteBreakdown: { participantName: string; chips: number }[];
}

export function ResultPhase({
  room,
  items,
  participants,
  currentParticipant,
  votes,
  comments,
}: ResultPhaseProps) {
  const voterCount = new Set(votes.map((v) => v.participant_id)).size;

  // 順位を計算
  const rankedItems = calculateRanking(
    items,
    votes,
    comments,
    participants,
    currentParticipant?.id ?? ""
  );

  function getCommentAuthor(c: Comment) {
    if (room.comments_anonymous_mode === "on") return "匿名";
    // optional モードでは将来的に is_anonymous フラグ対応
    if (currentParticipant && c.participant_id === currentParticipant.id)
      return "あなた";
    return (
      participants.find((p) => p.id === c.participant_id)?.nickname ?? "不明"
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="text-center mb-[18px]">
        <div className="text-[28px] leading-none mb-1.5">🏆</div>
        <h1 className="text-[17px] font-medium text-text-primary">結果発表</h1>
        <p className="text-[11px] text-text-secondary">
          {room.name}・{voterCount}人が投票
        </p>
      </div>

      {/* ランキング */}
      {rankedItems.map((ranked) => {
        const isWinner = ranked.rank === 1;

        return (
          <div
            key={ranked.item.id}
            className={`p-3 rounded-md mb-3 ${
              isWinner
                ? "border-2 border-border-info bg-bg-info"
                : "border-[0.5px] border-black/15"
            }`}
          >
            {/* 順位 + 商品名 */}
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-[10px] ${
                  isWinner
                    ? "bg-text-info text-white"
                    : "bg-bg-secondary text-text-secondary"
                }`}
              >
                {ranked.rank}位
              </span>
              <span
                className={`text-[13px] font-medium ${
                  isWinner ? "text-text-info text-sm" : ""
                }`}
              >
                {ranked.item.product_url ? (
                  <a
                    href={ranked.item.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {ranked.item.name}
                  </a>
                ) : (
                  ranked.item.name
                )}
              </span>
            </div>

            {/* チップ可視化 */}
            <div
              className={`flex gap-1 flex-wrap min-h-5 p-1.5 rounded-md mb-2.5 ${
                isWinner ? "bg-bg-primary" : "bg-bg-secondary"
              }`}
            >
              {Array.from({ length: ranked.totalChips }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full bg-text-info border border-text-info ${
                    isWinner ? "" : "opacity-70"
                  }`}
                />
              ))}
              {ranked.totalChips === 0 && (
                <span className="text-[11px] text-text-tertiary">
                  チップなし
                </span>
              )}
            </div>

            {/* 獲得チップ数 */}
            <div className="flex justify-between items-baseline">
              <span
                className={`text-[11px] ${
                  isWinner ? "text-text-info" : "text-text-secondary"
                }`}
              >
                獲得チップ
              </span>
              <span
                className={`font-medium ${
                  isWinner
                    ? "text-lg text-text-info"
                    : "text-base text-text-primary"
                }`}
              >
                {ranked.totalChips}個
              </span>
            </div>

            {/* 投票内訳（detailed モードのみ、カード内に表示） */}
            {room.vote_visibility === "detailed" &&
              ranked.voteBreakdown.length > 0 && (
                <details className="mt-2">
                  <summary className="text-[11px] text-text-tertiary cursor-pointer">
                    投票内訳を見る
                  </summary>
                  <div className="mt-1 pl-2 border-l-2 border-black/10">
                    {ranked.voteBreakdown.map((v, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-[11px] text-text-secondary py-0.5"
                      >
                        <span>{v.participantName}</span>
                        <span>{v.chips}チップ</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

            {/* コメント */}
            <div
              className={`border-t-[0.5px] mt-2.5 pt-2.5 ${
                isWinner ? "border-border-info" : "border-black/15"
              }`}
            >
              {ranked.itemComments.length > 0 ? (
                <>
                  <div
                    className={`text-[11px] mb-1.5 ${
                      isWinner
                        ? "text-text-info font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    💬 コメント {ranked.itemComments.length}件
                  </div>
                  {ranked.itemComments.map((c) => (
                    <div key={c.id} className="mb-1.5">
                      <div className="text-[11px] text-text-secondary font-medium mb-0.5">
                        {getCommentAuthor(c)}
                      </div>
                      <div className="text-xs leading-relaxed">{c.body}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-[11px] text-text-tertiary text-center">
                  コメントなし
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function calculateRanking(
  items: Item[],
  votes: Vote[],
  comments: Comment[],
  participants: Participant[],
  currentParticipantId: string
): RankedItem[] {
  const itemScores = items.map((item) => {
    const itemVotes = votes.filter((v) => v.item_id === item.id);
    const totalChips = itemVotes.reduce((sum, v) => sum + v.chips, 0);
    const itemComments = comments.filter((c) => c.item_id === item.id);

    const voteBreakdown = itemVotes
      .filter((v) => v.chips > 0)
      .map((v) => ({
        participantName:
          v.participant_id === currentParticipantId
            ? "あなた"
            : participants.find((p) => p.id === v.participant_id)?.nickname ??
              "不明",
        chips: v.chips,
      }))
      .sort((a, b) => b.chips - a.chips);

    return { item, totalChips, itemComments, voteBreakdown };
  });

  itemScores.sort((a, b) => b.totalChips - a.totalChips);

  let currentRank = 1;
  return itemScores.map((score, index) => {
    if (index > 0 && score.totalChips < itemScores[index - 1].totalChips) {
      currentRank = index + 1;
    }
    return { ...score, rank: currentRank };
  });
}
