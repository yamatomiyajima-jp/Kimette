import type { Participant } from "@/lib/types";

export function ParticipantsList({
  participants,
  isAnonymous,
}: {
  participants: Participant[];
  isAnonymous: boolean;
}) {
  return (
    <div className="bg-bg-secondary rounded-md p-2.5 mb-3">
      <div className="text-[11px] text-text-tertiary mb-0.5">
        参加者（{participants.length}人）
      </div>
      {!isAnonymous && (
        <div className="text-[12px] text-text-secondary">
          {participants.map((p) => p.nickname).join("、")}
        </div>
      )}
    </div>
  );
}
